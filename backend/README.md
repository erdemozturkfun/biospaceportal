## How to run locally

Conda or Miniconda must be installed and in your path.

Create Virtual Environment

```conda create -n backend-env python=3.10```

Install Dependencies

    conda install pytorch::pytorch conda-forge::transformers conda-forge::sentence-transformers pytorch::faiss-cpu
    pip install fastapi[standart]

Run server.py using uvicorn

    uvicorn server:app --host 0.0.0.0 --port 8000
