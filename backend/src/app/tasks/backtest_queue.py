# backend/src/app/tasks/backtest_queue.py
import threading
import queue
import time
import logging

_task_q = queue.Queue()
_worker_thread = None
_RUNNING = False

def _worker_loop():
    while _RUNNING:
        try:
            func, args, kwargs = _task_q.get(timeout=1)
            try:
                func(*args, **kwargs)
            except Exception as e:
                logging.exception("Background task failed")
            _task_q.task_done()
        except queue.Empty:
            continue

def start_worker():
    global _worker_thread, _RUNNING
    if _worker_thread is None:
        _RUNNING = True
        _worker_thread = threading.Thread(target=_worker_loop, daemon=True)
        _worker_thread.start()

def stop_worker():
    global _RUNNING
    _RUNNING = False

def enqueue_task(func, *args, **kwargs):
    start_worker()
    _task_q.put((func, args, kwargs))
    return True
