from datetime import datetime
import sys
import os

# 'backend' ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# 'db_control' ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db  # backendディレクトリのapp.pyからappとdbをインポート
from mymodels import CareTask  # db_controlディレクトリのmymodels.pyからCareTaskをインポート

# アプリケーションコンテキストを使用してデータベース操作を行う
with app.app_context():
    # 8月16日のテストデータ
    test_data = [
        {'user_id': 1, 'date': datetime(2024, 8, 16), 'task_name': '朝ごはん', 'status': 'completed'},
        {'user_id': 2, 'date': datetime(2024, 8, 16), 'task_name': '夕ごはん', 'status': 'completed'},
        {'user_id': 3, 'date': datetime(2024, 8, 16), 'task_name': '朝散歩', 'status': 'completed'},
        {'user_id': 4, 'date': datetime(2024, 8, 16), 'task_name': '夕散歩', 'status': 'completed'},
    ]

    # データベースにデータを挿入
    for task in test_data:
        new_task = CareTask(
            user_id=task['user_id'],
            date=task['date'],
            task_name=task['task_name'],
            status=task['status']
        )
        db.session.add(new_task)

    # コミットしてデータを保存
    db.session.commit()
