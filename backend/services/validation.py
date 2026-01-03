import pandas as pd
import re
from typing import List, Dict, Any, Tuple

# Sensitive keywords (Proprietary logic)
SENSITIVE_KEYWORDS = ['chart_no', 'chartno', 'birth_date', 'birthdate', 'dob', 'patient_id', 'id_number', 'ssn', 'patient_name', 'name']

def check_sensitive_data(df: pd.DataFrame) -> List[str]:
    """
    Checks if any column name contains sensitive keywords.
    Returns a list of sensitive column names found.
    """
    sensitive_found = []
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in SENSITIVE_KEYWORDS):
            sensitive_found.append(col)
    return sensitive_found

def validate_dataframe(df: pd.DataFrame, schema_structure: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
    """
    Validates the dataframe against the schema using Pandas.
    
    Supported schema column options:
    - name: column name (required)
    - required: boolean (default: False)
    - type: "string" | "int" | "integer" | "float" (default: "string")
    - min: minimum value for numeric types
    - max: maximum value for numeric types
    - allowed_values: list of allowed values (for categorical/enum types)
    - format: regex pattern for string format validation (e.g., "YYYY-MM-DD" -> r"^\\d{4}-\\d{2}-\\d{2}$")
    
    Returns (is_valid, report).
    """
    errors = []
    warnings = []
    
    if "columns" not in schema_structure:
        return True, {"errors": [], "warnings": [], "stats": {"columns_validated": 0}}
    
    schema_columns = schema_structure["columns"]
    df_columns = set(df.columns)
    
    for col_def in schema_columns:
        col_name = col_def.get("name")
        required = col_def.get("required", False)
        col_type = col_def.get("type", "string")
        min_val = col_def.get("min")
        max_val = col_def.get("max")
        allowed_values = col_def.get("allowed_values")
        format_pattern = col_def.get("format")
        
        # 1. Check if required column exists
        if required and col_name not in df_columns:
            errors.append(f"缺少必要欄位: {col_name}")
            continue
        
        # Skip all checks if column doesn't exist
        if col_name not in df_columns:
            continue
        
        non_null = df[col_name].dropna()
        if len(non_null) == 0:
            continue  # All values are null, skip validation
        
        # 2. Type validation (supports single type or array of types)
        col_types = col_type if isinstance(col_type, list) else [col_type]
        
        # Skip type validation for 'any' or 'string' (always passes)
        if 'any' in col_types or 'string' in col_types:
            type_valid = True
        else:
            type_valid = False
            type_errors = []
            
            for t in col_types:
                if t in ["int", "integer"]:
                    try:
                        if not pd.api.types.is_numeric_dtype(non_null):
                            numeric_vals = pd.to_numeric(non_null, errors='raise')
                        else:
                            numeric_vals = non_null
                        
                        # Check for decimals (should be integers)
                        if all(numeric_vals == numeric_vals.astype(int)):
                            type_valid = True
                            break
                    except (ValueError, TypeError):
                        type_errors.append("整數")
                
                elif t == "float":
                    try:
                        if not pd.api.types.is_numeric_dtype(non_null):
                            pd.to_numeric(non_null, errors='raise')
                        type_valid = True
                        break
                    except (ValueError, TypeError):
                        type_errors.append("數值")
                
                elif t in ["datetime", "date"]:
                    try:
                        pd.to_datetime(non_null, errors='raise')
                        type_valid = True
                        break
                    except (ValueError, TypeError):
                        type_errors.append("日期")
            
            if not type_valid:
                expected = "/".join(type_errors) if type_errors else "/".join(col_types)
                errors.append(f"欄位 {col_name} 類型錯誤 (預期: {expected})")
                continue  # Skip range check if type is wrong

        
        # 3. Range validation (min/max)
        if col_type in ["int", "integer", "float"] and (min_val is not None or max_val is not None):
            try:
                numeric_vals = pd.to_numeric(non_null, errors='coerce')
                
                if min_val is not None:
                    below_min = numeric_vals < min_val
                    if below_min.any():
                        count = below_min.sum()
                        errors.append(f"欄位 {col_name} 有 {count} 筆值小於最小值 {min_val}")
                
                if max_val is not None:
                    above_max = numeric_vals > max_val
                    if above_max.any():
                        count = above_max.sum()
                        errors.append(f"欄位 {col_name} 有 {count} 筆值大於最大值 {max_val}")
            except Exception:
                pass  # Already reported type error above
        
        # 4. Allowed values validation (enum/categorical)
        if allowed_values is not None and len(allowed_values) > 0:
            # Convert to string for comparison
            str_values = non_null.astype(str)
            allowed_str = [str(v) for v in allowed_values]
            
            invalid_mask = ~str_values.isin(allowed_str)
            if invalid_mask.any():
                invalid_values = str_values[invalid_mask].unique()[:5]  # Show first 5 unique invalid values
                errors.append(f"欄位 {col_name} 包含無效值: {list(invalid_values)} (允許值: {allowed_values})")
        
        # 5. Format validation (regex pattern)
        if format_pattern is not None:
            try:
                pattern = re.compile(format_pattern)
                str_values = non_null.astype(str)
                
                def check_format(val):
                    return bool(pattern.match(str(val)))
                
                invalid_mask = ~str_values.apply(check_format)
                if invalid_mask.any():
                    count = invalid_mask.sum()
                    sample_invalid = str_values[invalid_mask].head(3).tolist()
                    errors.append(f"欄位 {col_name} 有 {count} 筆值格式錯誤 (格式: {format_pattern}, 例: {sample_invalid})")
            except re.error as e:
                warnings.append(f"欄位 {col_name} 的格式規則無效: {format_pattern}")
    
    is_valid = len(errors) == 0
    
    report = {
        "errors": errors,
        "warnings": warnings,
        "stats": {
            "columns_validated": len(schema_columns),
            "columns_in_file": len(df_columns),
            "rows": len(df)
        }
    }
    
    return is_valid, report
