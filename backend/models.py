from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    schemas = relationship("Schema", back_populates="project")
    submissions = relationship("Submission", back_populates="project")

class Schema(Base):
    __tablename__ = "schemas"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    structure = Column(JSON, nullable=False)  # Stores the schema definition (JSON Schema or custom format)
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="schemas")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    center_name = Column(String, index=True, nullable=False)
    uploader_name = Column(String, nullable=True) # New field
    filename = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="pending")  # pending, validated, rejected
    validation_report = Column(JSON, nullable=True)
    
    # We might store the actual data as JSON or just keep the file. 
    # For flexibility and queryability, storing processed data as JSON is good.
    data = Column(JSON, nullable=True) 

    project = relationship("Project", back_populates="submissions")
