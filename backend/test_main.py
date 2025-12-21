from fastapi.testclient import TestClient
from main import app
import os

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "2.0"}

def test_load_demo():
    # Ensure test_data.csv exists
    assert os.path.exists("test_data.csv")
    response = client.post("/load-demo")
    assert response.status_code == 200
    data = response.json()
    assert "graph" in data
    assert "nodes" in data["graph"]
    assert "edges" in data["graph"]
    assert len(data["graph"]["nodes"]) > 0

def test_process_csv_valid():
    csv_content = "ID,Type,Label\nDOC-1,Document,Test Doc\nAlice,Person,Alice"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    response = client.post("/process-csv", files=files)
    assert response.status_code == 200
    data = response.json()
    assert len(data["graph"]["nodes"]) == 5 # DOC-1, Document, Test Doc, Alice, Person
    # Note: Alice is added as a node because she is linked? 
    # Wait, my logic adds nodes for ID col + other columns.
    # ID=DOC-1 -> Node DOC-1. Type=Document.
    # Col=Type -> Value=Document. Target=Document. Edge DOC-1 -> Document (type=Type).
    # Col=Label -> Value=Test Doc. Target=Test Doc. Edge DOC-1 -> Test Doc (type=Label).
    # Ah, the logic in main.py:
    # iteration over columns. 
    # Row 1: ID=DOC-1. 
    #   Col Type=Document. Node Document. Edge DOC-1->Document.
    #   Col Label=Test Doc. Node Test Doc. Edge DOC-1->Test Doc.
    # Row 2: ID=Alice.
    #   Col Type=Person. Node Person. Edge Alice->Person.
    #   Col Label=Alice. Node Alice. Edge Alice->Alice (Self loop?).
    
    # Wait, my test data above might be slightly confusing with 'Type' column if I treat it as a relation.
    # But strictly based on code: 'nodes' count should be sufficient.
    assert len(data["graph"]["nodes"]) >= 2

def test_process_csv_missing_id():
    csv_content = "Name,Age\nAlice,30"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    response = client.post("/process-csv", files=files)
    # expect 500 or 400? Code raises ValueError which is caught as 400.
    assert response.status_code == 400
