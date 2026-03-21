import base64
import cv2
import numpy as np
import io
import random
from flask import Flask, jsonify, request
from flask_cors import CORS
from textblob import TextBlob
import json
import os

# Load Responses
RESPONSES = {}
def load_responses():
    global RESPONSES
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'data', 'responses.json')
        with open(json_path, 'r') as f:
            RESPONSES = json.load(f)
        print("Responses loaded successfully.")
    except Exception as e:
        print(f"Error loading responses: {e}")
        RESPONSES = {"default": ["I'm here for you."]}

load_responses()

def get_suggested_response(emotion):
    """Get a random response for the given emotion."""
    emotion = emotion.lower()
    # Handle some mapping if needed
    if emotion in ['positive', 'energetic']: key = 'happy'
    elif emotion in ['negative', 'fear', 'angry']: key = 'sad' # fallback group if specific key missing
    else: key = emotion
    
    # Try exact match first, then fallback
    if key not in RESPONSES:
        # Check if we have specific keys for angry/fear etc in JSON, if not use default
        if emotion in RESPONSES: key = emotion
        else: key = 'default'
        
    options = RESPONSES.get(key, RESPONSES.get('default', ["Top of the morning to you."]))
    return random.choice(options)

# Try importing AI libraries (Face)
try:
    from deepface import DeepFace
    FACE_AI_AVAILABLE = True
except ImportError:
    print("Warning: DeepFace library not found. Simulation mode active.")
    FACE_AI_AVAILABLE = False

# Try importing AI libraries (Audio)
try:
    import librosa
    AUDIO_AI_AVAILABLE = True
except ImportError:
    print("Warning: Librosa library not found. Simulation mode active.")
    AUDIO_AI_AVAILABLE = False

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "EMOCARE+ AI Backend is running!",
        "ai_engine": {
            "face": "DeepFace" if FACE_AI_AVAILABLE else "Simulation",
            "audio": "Librosa" if AUDIO_AI_AVAILABLE else "Simulation",
            "text": "TextBlob"
        }
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

def base64_to_image(base64_string):
    """Convert base64 string to numpy array image"""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

@app.route('/api/analyze/face', methods=['POST'])
def analyze_face():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        # Convert base64 to image
        img = base64_to_image(data['image'])
        
        if img is None:
            return jsonify({"error": "Failed to decode image"}), 400

        if FACE_AI_AVAILABLE:
            # Analyze with DeepFace
            result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
            
            if isinstance(result, list):
                result = result[0]
                
            return jsonify({
                "dominant_emotion": result['dominant_emotion'],
                "emotions": result['emotion'],
                "suggested_response": get_suggested_response(result['dominant_emotion'])
            })
        else:
            # Fallback Simulation if AI library failed to install
            emotions = ["happy", "neutral", "sad", "surprise", "fear", "angry"]
            dominant = "neutral" 
            # Simple heuristic: brightness
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            if brightness > 150: dominant = "happy"
            elif brightness < 80: dominant = "sad"
            
            return jsonify({
                "dominant_emotion": dominant,
                "emotions": {e: (0.9 if e == dominant else 0.05) for e in emotions},
                "note": "Running in Simulation Mode (AI Library missing)",
                "suggested_response": get_suggested_response(dominant)
            })

    except Exception as e:
        print(f"Error analyzing face: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze/text', methods=['POST'])
def analyze_text():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        blob = TextBlob(text)
        sentiment_score = blob.sentiment.polarity # -1 to 1
        
        # Map score to emotion category
        if sentiment_score > 0.5:
            emotion = "happy"
        elif sentiment_score > 0.1:
            emotion = "positive"
        elif sentiment_score < -0.5:
            emotion = "sad"
        elif sentiment_score < -0.1:
            emotion = "negative"
        else:
            emotion = "neutral"

        return jsonify({
            "score": sentiment_score,
            "emotion": emotion,
            "suggested_response": get_suggested_response(emotion)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Audio Analysis
@app.route('/api/analyze/audio', methods=['POST'])
def analyze_audio():
    try:
        data = request.json
        if not data or 'audio' not in data:
            return jsonify({"error": "No audio provided"}), 400

        # Decode audio
        audio_part = data['audio']
        if "," in audio_part:
            audio_part = audio_part.split(',')[1]
            
        audio_data = base64.b64decode(audio_part)
        
        if AUDIO_AI_AVAILABLE:
            # Save to temp file or memory
            with io.BytesIO(audio_data) as f:
                # Load audio (using soundfile implicit in librosa)
                y, sr = librosa.load(f, sr=None)
                
            # Extract Features
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            pitch = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
            
            # Simple rule-based emotion mapping
            if pitch > 2000:
                if tempo > 120:
                    emotion = "happy"; score = 0.8
                else:
                    emotion = "fear"; score = 0.6
            elif pitch < 1000:
                if tempo < 90:
                    emotion = "sad"; score = 0.7
                else:
                    emotion = "calm"; score = 0.9
            else:
                emotion = "neutral"; score = 0.8
        else:
             # Simulation Logic
             emotion = random.choice(["calm", "neutral", "happy", "energetic"])
             score = round(random.uniform(0.6, 0.9), 2)
             pitch = 0; tempo = 0
             print("Processing audio in Simulation Mode")

        return jsonify({
            "emotion": emotion,
            "score": float(score),
            "features": {
                "pitch": float(pitch),
                "tempo": float(tempo)
            },
            "mode": "AI" if AUDIO_AI_AVAILABLE else "Simulation",
            "suggested_response": get_suggested_response(emotion)
        })
    except Exception as e:
        print(f"Error analyzing audio: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Database Setup
import sqlite3
import datetime

def init_db():
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    # Mood logs table
    c.execute('''CREATE TABLE IF NOT EXISTS mood_logs 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  emotion TEXT, 
                  part_of_day TEXT,
                  score REAL, 
                  source TEXT, 
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # Resources table
    c.execute('''CREATE TABLE IF NOT EXISTS resources
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  description TEXT,
                  category TEXT,
                  url TEXT,
                  tags TEXT,
                  icon_type TEXT,
                  color TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # Bookmarks table
    c.execute('''CREATE TABLE IF NOT EXISTS bookmarks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  resource_id INTEGER,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (resource_id) REFERENCES resources(id))''')
    
    # GAD-7 Screening Results table
    c.execute('''CREATE TABLE IF NOT EXISTS gad7_results
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  score INTEGER NOT NULL,
                  severity_level TEXT,
                  answers TEXT,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # Check if resources are already seeded
    c.execute("SELECT COUNT(*) FROM resources")
    count = c.fetchone()[0]
    
    if count == 0:
        # Seed initial wellness resources
        resources_data = [
            # Articles
            ("Understanding Anxiety: Signs & Coping", "A comprehensive guide to identifying anxiety triggers and practical grounding techniques.", 
             "Articles", "https://www.nimh.nih.gov/health/topics/anxiety-disorders", "anxiety,coping,mental-health", "book", "blue"),
            
            ("The Science of Sleep & Mood", "How your circadian rhythm affects your emotional resilience and mental well-being.",
             "Articles", "https://www.sleepfoundation.org/mental-health", "sleep,mood,health", "book", "blue"),
            
            ("Mindfulness for Beginners", "Introduction to mindfulness meditation and its benefits for emotional regulation.",
             "Articles", "https://www.mindful.org/meditation/mindfulness-getting-started/", "mindfulness,meditation,stress", "book", "blue"),
            
            ("Managing Depression Daily", "Practical strategies for coping with depression and building resilience.",
             "Articles", "https://www.psychologytoday.com/us/basics/depression", "depression,coping,wellness", "book", "blue"),
            
            # Videos & Meditation
            ("5-Minute Stress Relief Breathing", "Guided audio session to lower your heart rate and find immediate calm.",
             "Meditation", "https://www.youtube.com/watch?v=YRPh_GaiL8s", "breathing,stress,meditation", "video", "purple"),
            
            ("10-Minute Morning Mindfulness", "Start your day with clarity and calm using this guided meditation.",
             "Meditation", "https://www.youtube.com/watch?v=U9YKY7fdwyg", "meditation,morning,mindfulness", "video", "purple"),
            
            ("Yoga for Emotional Balance", "Gentle movements to release physical tension stored from emotional stress.",
             "Exercise", "https://www.youtube.com/watch?v=COp7BR_Dvps", "yoga,exercise,stress-relief", "heart", "rose"),
            
            ("Body Scan Meditation", "20-minute guided practice for deep relaxation and body awareness.",
             "Meditation", "https://www.youtube.com/watch?v=15q-N-_kkrU", "meditation,relaxation,mindfulness", "video", "purple"),
            
            # Tools
            ("Headspace - Meditation App", "Popular meditation and mindfulness app with guided sessions for various needs.",
             "Tools", "https://www.headspace.com", "app,meditation,mindfulness", "external", "indigo"),
            
            ("Calm - Sleep & Meditation", "App featuring sleep stories, meditation, and breathing programs.",
             "Tools", "https://www.calm.com", "app,sleep,meditation", "external", "indigo"),
            
            ("MoodPath - Depression Tracker", "App to track your mood patterns and identify mental health trends.",
             "Tools", "https://moodpath.com", "app,tracking,depression", "external", "indigo"),
            
            ("Breathing Exercise Tool", "Interactive tool for various breathing techniques (4-7-8, box breathing).",
             "Tools", "https://www.calm.com/breathe", "breathing,relaxation,tool", "external", "indigo"),
            
            # Exercises & Techniques
            ("Journaling Prompts for Anxiety", "30 thoughtful prompts to process anxious thoughts and feelings.",
             "Exercise", "https://www.therapistaid.com/therapy-worksheet/anxiety-journal", "journaling,anxiety,self-reflection", "heart", "rose"),
            
            ("Progressive Muscle Relaxation", "Step-by-step guide to releasing physical tension throughout your body.",
             "Exercise", "https://www.anxietycanada.com/sites/default/files/MuscleRelaxation.pdf", "relaxation,exercise,stress", "heart", "rose"),
            
            ("Gratitude Practice Guide", "Build resilience and positive emotions through daily gratitude exercises.",
             "Exercise", "https://ggia.berkeley.edu/practice/gratitude_journal", "gratitude,positivity,wellbeing", "heart", "rose"),
            
            # Crisis Support
            ("24/7 Crisis Support - 988", "Immediate help for those in distress. You are not alone. Call or text 988.",
             "Hotline", "tel:988", "crisis,support,emergency", "phone", "red"),
            
            ("Crisis Text Line", "Free 24/7 support via text. Text HOME to 741741 from anywhere in the US.",
             "Hotline", "sms:741741", "crisis,support,text", "phone", "red"),
            
            ("SAMHSA Helpline", "Substance Abuse and Mental Health Services: 1-800-662-4357",
             "Hotline", "tel:1-800-662-4357", "support,mental-health,helpline", "phone", "red"),
            
            # Community
            ("Join Support Groups", "Connect with others who share similar experiences in a safe space.",
             "Community", "https://www.nami.org/Support-Education/Support-Groups", "community,support,groups", "external", "green"),
            
            ("Mental Health America", "Resources, screenings, and community support for mental wellness.",
             "Community", "https://www.mhanational.org", "resources,community,support", "external", "green"),
        ]
        
        c.executemany('''INSERT INTO resources (title, description, category, url, tags, icon_type, color)
                         VALUES (?, ?, ?, ?, ?, ?, ?)''', resources_data)
        print(f"Seeded {len(resources_data)} wellness resources.")
    
    conn.commit()
    conn.close()

init_db()

@app.route('/api/mood', methods=['POST'])
def log_mood():
    try:
        data = request.json
        emotion = data.get('emotion')
        score = data.get('score', 0.0)
        source = data.get('source', 'unknown') # live, text, etc
        
        # Simple Logic to determine Morning/Afternoon/Evening
        hour = datetime.datetime.now().hour
        if 5 <= hour < 12: part = "Morning"
        elif 12 <= hour < 17: part = "Afternoon"
        elif 17 <= hour < 21: part = "Evening"
        else: part = "Night"

        conn = sqlite3.connect('emocare.db')
        c = conn.cursor()
        c.execute("INSERT INTO mood_logs (emotion, score, source, part_of_day) VALUES (?, ?, ?, ?)",
                  (emotion, score, source, part))
        conn.commit()
        conn.close()
        
        return jsonify({"status": "success", "message": "Mood logged"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    # 1. Total Check-ins
    c.execute("SELECT COUNT(*) FROM mood_logs")
    total = c.fetchone()[0]
    
    # 2. Streak (Simplified: Count unique days in last 30 days)
    # Note: A real streak algo is more complex, this is a "Activity Score" proxy
    c.execute("SELECT COUNT(DISTINCT date(timestamp)) FROM mood_logs")
    active_days = c.fetchone()[0]
    
    # 3. Last Mood
    c.execute("SELECT emotion, score FROM mood_logs ORDER BY id DESC LIMIT 1")
    last = c.fetchone()
    
    conn.close()
    
    return jsonify({
        "total_checkins": total,
        "active_days": active_days,
        "active_days": active_days,
        "last_mood": {
            "emotion": last[0], 
            "score": last[1],
            "suggested_response": get_suggested_response(last[0])
        } if last else None
    })

@app.route('/api/mood/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    # Get counts of "positive" vs "negative" roughly for the last 7 days
    # Mapping emotions to categories for chart
    # This is a basic aggregation for the chart
    
    query = """
        SELECT 
            strftime('%Y-%m-%d', timestamp) as day,
            emotion,
            COUNT(*) as count
        FROM mood_logs 
        WHERE timestamp >= date('now', '-6 days')
        GROUP BY day, emotion
    """
    c.execute(query)
    rows = c.fetchall()
    conn.close()
    
    # Process into Chart Data format: [{name: 'Mon', stress: 10, calm: 90}]
    # Map emotions: 
    # Positive/Calm/Happy -> 'calm'
    # Negative/Sad/Fear/Angry -> 'stress'
    
    days_map = {}
    
    # Initialize last 7 days including today
    base = datetime.datetime.today()
    date_list = [base - datetime.timedelta(days=x) for x in range(7)]
    for date in reversed(date_list):
        day_str = date.strftime('%Y-%m-%d')
        day_name = date.strftime('%a') # Mon, Tue
        # Initialize with 0 for stacking
        days_map[day_str] = {"name": day_name, "stress": 0, "calm": 0, "total": 0}

    for r in rows:
        day_str = r[0]
        emotion = r[1].lower() if r[1] else "neutral"
        count = r[2]
        
        if day_str in days_map:
            # Enhanced mapping for simulation data
            if emotion in ['happy', 'neutral', 'calm', 'positive', 'surprise', 'energetic']:
                days_map[day_str]['calm'] += count
            else:
                days_map[day_str]['stress'] += count
            days_map[day_str]['total'] += count
            
    # Convert to list
    result = []
    for k, v in days_map.items():
        result.append({
            "name": v['name'], 
            "stress": v['stress'], 
            "calm": v['calm'],
            "total": v['total']
        })
            
    return jsonify(result)
            
    return jsonify(result)

@app.route('/api/mood/recent', methods=['GET'])
def get_recent_moods():
    """Get the most recent mood check-ins."""
    limit = request.args.get('limit', 3, type=int)
    
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    c.execute("""
        SELECT emotion, timestamp 
        FROM mood_logs 
        ORDER BY id DESC 
        LIMIT ?
    """, (limit,))
    
    rows = c.fetchall()
    conn.close()
    
    result = [{"emotion": row[0], "timestamp": row[1]} for row in rows]
    return jsonify(result)

@app.route('/api/response', methods=['GET'])
def get_response_api():
    emotion = request.args.get('emotion', 'neutral')
    return jsonify({"response": get_suggested_response(emotion)})

# ===== WELLNESS RESOURCES ENDPOINTS =====

@app.route('/api/resources', methods=['GET'])
def get_resources():
    """Get all wellness resources with optional filtering."""
    category = request.args.get('category')
    search = request.args.get('search', '').lower()
    
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    query = "SELECT id, title, description, category, url, tags, icon_type, color FROM resources WHERE 1=1"
    params = []
    
    if category and category != 'All':
        query += " AND category = ?"
        params.append(category)
    
    if search:
        query += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)"
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])
    
    query += " ORDER BY created_at DESC"
    
    c.execute(query, params)
    rows = c.fetchall()
    
    # Get all bookmarked resource IDs
    c.execute("SELECT resource_id FROM bookmarks")
    bookmarked_ids = {row[0] for row in c.fetchall()}
    
    conn.close()
    
    resources = []
    for row in rows:
        resources.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "category": row[3],
            "url": row[4],
            "tags": row[5].split(',') if row[5] else [],
            "icon_type": row[6],
            "color": row[7],
            "bookmarked": row[0] in bookmarked_ids
        })
    
    return jsonify(resources)

@app.route('/api/resources/categories', methods=['GET'])
def get_resource_categories():
    """Get all unique resource categories."""
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    c.execute("SELECT DISTINCT category FROM resources ORDER BY category")
    categories = [row[0] for row in c.fetchall()]
    
    conn.close()
    
    return jsonify(["All"] + categories)

@app.route('/api/resources/bookmark', methods=['POST'])
def toggle_bookmark():
    """Toggle bookmark for a resource."""
    data = request.json
    resource_id = data.get('resource_id')
    
    if not resource_id:
        return jsonify({"error": "resource_id required"}), 400
    
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    # Check if already bookmarked
    c.execute("SELECT id FROM bookmarks WHERE resource_id = ?", (resource_id,))
    existing = c.fetchone()
    
    if existing:
        # Remove bookmark
        c.execute("DELETE FROM bookmarks WHERE resource_id = ?", (resource_id,))
        bookmarked = False
    else:
        # Add bookmark
        c.execute("INSERT INTO bookmarks (resource_id) VALUES (?)", (resource_id,))
        bookmarked = True
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "bookmarked": bookmarked})

@app.route('/api/resources/bookmarks', methods=['GET'])
def get_bookmarks():
    """Get all bookmarked resources."""
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    c.execute("""
        SELECT r.id, r.title, r.description, r.category, r.url, r.tags, r.icon_type, r.color
        FROM resources r
        INNER JOIN bookmarks b ON r.id = b.resource_id
        ORDER BY b.created_at DESC
    """)
    
    rows = c.fetchall()
    conn.close()
    
    resources = []
    for row in rows:
        resources.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "category": row[3],
            "url": row[4],
            "tags": row[5].split(',') if row[5] else [],
            "icon_type": row[6],
            "color": row[7],
            "bookmarked": True
        })
    
    return jsonify(resources)

# ===== GAD-7 SCREENING ENDPOINTS =====

@app.route('/api/gad7/submit', methods=['POST'])
def submit_gad7():
    """Submit GAD-7 screening results."""
    data = request.json
    score = data.get('score')
    severity_level = data.get('severity_level')
    answers = data.get('answers', {})
    
    if score is None:
        return jsonify({"error": "score required"}), 400
    
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    # Store answers as JSON string
    import json
    answers_json = json.dumps(answers)
    
    c.execute('''INSERT INTO gad7_results (score, severity_level, answers)
                 VALUES (?, ?, ?)''', (score, severity_level, answers_json))
    
    result_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "id": result_id,
        "score": score,
        "severity_level": severity_level
    })

@app.route('/api/gad7/history', methods=['GET'])
def get_gad7_history():
    """Get GAD-7 screening history."""
    limit = request.args.get('limit', 10, type=int)
    
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    c.execute('''SELECT id, score, severity_level, timestamp
                 FROM gad7_results
                 ORDER BY timestamp DESC
                 LIMIT ?''', (limit,))
    
    rows = c.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        history.append({
            "id": row[0],
            "score": row[1],
            "severity_level": row[2],
            "timestamp": row[3]
        })
    
    return jsonify(history)

@app.route('/api/gad7/latest', methods=['GET'])
def get_latest_gad7():
    """Get the most recent GAD-7 result."""
    conn = sqlite3.connect('emocare.db')
    c = conn.cursor()
    
    c.execute('''SELECT id, score, severity_level, timestamp
                 FROM gad7_results
                 ORDER BY timestamp DESC
                 LIMIT 1''')
    
    row = c.fetchone()
    conn.close()
    
    if row:
        return jsonify({
            "id": row[0],
            "score": row[1],
            "severity_level": row[2],
            "timestamp": row[3]
        })
    else:
        return jsonify(None)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
