import pandas as pd
import json

def generate_schema(file_path):
    try:
        df = pd.read_excel(file_path)
        
        columns = []
        for col in df.columns:
            col_lower = col.lower()
            col_type = "string"
            required = True
            
            # Type Inference Logic
            if any(x in col_lower for x in ['age', 'year', 'days', 'min', 'score', 'number', 'count', 'cycles', 'id', 'stage']):
                # Special case: some IDs might be alphanumeric, but usually int in DBs. 
                # Let's keep ID as string if it might contain letters (e.g. chart_no), but 'id' suffix usually implies int or string.
                # However, chart_no is definitely string.
                if 'chart' in col_lower or 'case' in col_lower:
                    col_type = "string"
                elif 'size' in col_lower or 'cm' in col_lower or 'ml' in col_lower:
                     col_type = "float"
                else:
                    # Int heuristic
                     if any(x in col_lower for x in ['days', 'min', 'cycles', 'node', 'harvested', 'positive']):
                         col_type = "int"
                     else:
                         col_type = "string" # Fallback
            
            if any(x in col_lower for x in ['bmi', 'weight', 'height', 'cm', 'ml']):
                col_type = "float"

            # Specific overrides based on known fields
            if col == 'pT_stage' or col == 'pN_stage' or col == 'cT_stage' or col == 'cN_stage':
                 col_type = "string" # Staging is often string like 'T3', 'N1a'
            if col == 'tumor_height_cm' or col == 'tumor_size_cm' or col == 'distal_margin_cm':
                col_type = "float"
            if col == 'blood_loss_ml':
                 col_type = "float"
            if col == 'age':
                col_type = "int"

            columns.append({
                "name": col,
                "required": required,
                "type": col_type
            })
            
        schema = {
            "columns": columns
        }
        
        # Write to file
        with open("schema_export.json", "w", encoding="utf-8") as f:
            json.dump(schema, f, indent=2, ensure_ascii=False)
        print("Schema exported to schema_export.json")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    file_path = "/Users/huangshifeng/Desktop/SSA_multicenter/multicenter_schema.xlsx"
    generate_schema(file_path)
