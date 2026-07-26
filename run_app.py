import os
import sys
import subprocess

# Force UTF-8 encoding for standard output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")


def install_python_deps():
    print("[1/3] Checking Python backend dependencies...")
    req_file = os.path.join(BACKEND_DIR, "requirements.txt")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", req_file], check=True)


def install_npm_deps():
    print("[2/3] Checking Frontend node_modules...")
    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.exists(node_modules):
        print("Installing npm dependencies...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, shell=True, check=True)


def run():
    print("=" * 60)
    print(" VLM Intelligent Hallucination Studio - Full Stack Runner")
    print("=" * 60)

    try:
        install_python_deps()
        install_npm_deps()
    except Exception as e:
        print(f"Warning during dependency check: {e}")

    print("[3/3] Launching FastAPI Backend & Vite Frontend Servers...")

    # Start FastAPI Backend
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=BACKEND_DIR,
        shell=False
    )

    # Start Vite Frontend
    frontend_process = subprocess.Popen(
        ["npx", "vite", "--port", "3000"],
        cwd=FRONTEND_DIR,
        shell=True
    )

    print("\n" + "=" * 60)
    print(" VLM Studio is running live!")
    print(" -> Frontend URL:  http://localhost:3000")
    print(" -> Backend API:   http://127.0.0.1:8000")
    print(" -> API Swagger:   http://127.0.0.1:8000/docs")
    print("=" * 60 + "\n")

    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down VLM Studio servers...")
        backend_process.terminate()
        frontend_process.terminate()


if __name__ == "__main__":
    run()
