#!/usr/bin/env python3
"""
Escritoras da Liberdade - Plataforma Popular de Ensino para Pessoas Pretas
Iniciativa do Projeto Baobá (Fundo Baobá para Equidade Racial)
Multi-tenant por Polos/Núcleos, Sala Online até 100 participantes,
Desempenho da Educanda, Avaliação Pedagógica e Liberação de Bolsas/Pagamentos.
"""

import sys
import os
import json
import sqlite3
import datetime
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "edutech.db")
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Tenants (Polos e Núcleos do Projeto Baobá)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        color TEXT DEFAULT '#d97706',
        badge TEXT,
        max_participants INTEGER DEFAULT 100,
        active_students INTEGER DEFAULT 0,
        active_professors INTEGER DEFAULT 0,
        created_at TEXT
    )
    """)

    # Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        role TEXT NOT NULL, -- 'master', 'professor', 'aluno'
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        avatar TEXT,
        discipline TEXT,
        hourly_rate REAL DEFAULT 90.0,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    """)

    # Classrooms
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classrooms (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        max_capacity INTEGER DEFAULT 100,
        current_participants INTEGER DEFAULT 84,
        jitsi_room_name TEXT,
        started_at TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (professor_id) REFERENCES users(id)
    )
    """)

    # Activities (Provas, Ensaios e Oficinas)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL, -- 'prova', 'atividade', 'ensaio'
        subject TEXT NOT NULL,
        due_date TEXT NOT NULL,
        max_score REAL DEFAULT 10.0,
        questions_json TEXT,
        created_at TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (professor_id) REFERENCES users(id)
    )
    """)

    # Submissions (Entregas e Produções das Alunas)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        aluno_id TEXT NOT NULL,
        status TEXT DEFAULT 'pendente', -- 'pendente', 'corrigido'
        answers_json TEXT,
        score REAL,
        feedback TEXT,
        submitted_at TEXT,
        graded_at TEXT,
        FOREIGN KEY (activity_id) REFERENCES activities(id),
        FOREIGN KEY (aluno_id) REFERENCES users(id)
    )
    """)

    # Monthly Reports (Relatórios Mensais de Atividades Docentes / Prestação de Contas)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teacher_monthly_reports (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        professor_id TEXT NOT NULL,
        month_ref TEXT NOT NULL,
        hours_taught REAL NOT NULL,
        classes_count INTEGER NOT NULL,
        students_assisted INTEGER NOT NULL,
        description TEXT NOT NULL,
        hourly_rate REAL NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pendente', -- 'pendente', 'aprovado', 'pago', 'rejeitado'
        master_feedback TEXT,
        payment_date TEXT,
        payment_reference TEXT,
        created_at TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (professor_id) REFERENCES users(id)
    )
    """)

    # Chat da Sala de Aula
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classroom_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        classroom_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        role TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT
    )
    """)

    # Fila de Dúvidas / Mãos Levantadas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classroom_hand_raises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        classroom_id TEXT NOT NULL,
        aluno_id TEXT NOT NULL,
        aluno_name TEXT NOT NULL,
        status TEXT DEFAULT 'waiting',
        created_at TEXT
    )
    """)

    # Seed data if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM tenants")
    if cursor.fetchone()["cnt"] == 0:
        seed_data(cursor)

    conn.commit()
    conn.close()

def seed_data(cursor):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Polos / Núcleos do Projeto Baobá
    tenants = [
        ("tenant-baoba-salvador", "Polo Dandara dos Palmares (Salvador - BA)", "dandara", "#d97706", "DANDARA", 100, 290, 18, now),
        ("tenant-baoba-sp", "Núcleo Carolina Maria de Jesus (São Paulo - SP)", "carolina", "#ea580c", "CAROLINA", 100, 310, 22, now),
        ("tenant-baoba-rj", "Polo Lélia Gonzalez (Rio de Janeiro - RJ)", "lelia", "#b45309", "LÉLIA", 100, 240, 16, now)
    ]
    cursor.executemany("INSERT INTO tenants VALUES (?,?,?,?,?,?,?,?,?)", tenants)

    # Usuários (Master, Educadoras e Educandas)
    users = [
        # Master Baobá
        ("user-master-baoba", None, "master", "Coordenação Geral (Projeto Baobá)", "coordenacao@projetobaoba.org.br", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", "Gestão & Fomento Educacional", 0.0),
        
        # Educadoras / Professoras
        ("prof-dandara", "tenant-baoba-salvador", "professor", "Profa. Me. Dandara Nascimento", "dandara.nascimento@projetobaoba.org.br", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Literatura Negra & Escrevivência", 90.0),
        ("prof-sueli", "tenant-baoba-sp", "professor", "Profa. Dra. Sueli Santos", "sueli.santos@projetobaoba.org.br", "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150", "Redação Crítica & Letramento Racial", 95.0),
        ("prof-luisa", "tenant-baoba-rj", "professor", "Profa. Me. Luísa Bairros", "luisa.bairros@projetobaoba.org.br", "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150", "História Social & Pensamento Decolonial", 90.0),
        
        # Educandas / Alunas
        ("aluno-marielle", "tenant-baoba-salvador", "aluno", "Marielle Oliveira", "marielle.oliveira@estudante.baoba.org.br", "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150", "Literatura & Escrita Criativa", 0.0),
        ("aluno-esperanca", "tenant-baoba-salvador", "aluno", "Esperança Garcia", "esperanca.garcia@estudante.baoba.org.br", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "Redação Crítica", 0.0),
        ("aluno-aqualtune", "tenant-baoba-salvador", "aluno", "Aqualtune Silva", "aqualtune.silva@estudante.baoba.org.br", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "Literatura & Escrevivência", 0.0),
        ("aluno-anita", "tenant-baoba-sp", "aluno", "Anita Sacramento", "anita.sacramento@estudante.baoba.org.br", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "Redação Crítica", 0.0),
    ]
    cursor.executemany("INSERT INTO users VALUES (?,?,?,?,?,?,?,?)", users)

    # Sala de Aula Ao Vivo (Capacidade para até 100 participantes simultâneas)
    classroom_id = "sala-escrevivencia-100"
    cursor.execute("""
    INSERT INTO classrooms VALUES (?,?,?,?,?,?,?,?,?,?)
    """, (
        classroom_id,
        "tenant-baoba-salvador",
        "prof-dandara",
        "Oficina Magna Ao Vivo: Escrevivência, Memória e Narrativas de Resistência",
        "Literatura Negra & Escrevivência",
        "active",
        100,
        84, # 84 educandas conectadas simultaneamente!
        "EscritorasLiberdade-Baoba-SalaMagna",
        now
    ))

    # Mensagens iniciais do chat
    messages = [
        (classroom_id, "prof-dandara", "Profa. Me. Dandara Nascimento", "professor", "Ubuntu! Sejam todas muito bem-vindas à nossa oficina de Escrevivência. Nossa aula hoje conecta ancestralidade, memória e produção literária.", now),
        (classroom_id, "aluno-marielle", "Marielle Oliveira", "aluno", "Boa noite, professora Dandara e companheiras! Áudio e imagem perfeitos aqui em Salvador.", now),
        (classroom_id, "aluno-esperanca", "Esperança Garcia", "aluno", "Boa noite! Pronta com os cadernos de anotações. Essa leitura de Conceição Evaristo tocou profundamente.", now),
        (classroom_id, "prof-dandara", "Profa. Me. Dandara Nascimento", "professor", "Maravilha! Vamos abrir o quadro interativo para estruturar o conceito de escrevivência juntas.", now),
    ]
    cursor.executemany("INSERT INTO classroom_messages (classroom_id, user_id, user_name, role, message, created_at) VALUES (?,?,?,?,?,?)", messages)

    # Dúvida na fila
    cursor.execute("""
    INSERT INTO classroom_hand_raises (classroom_id, aluno_id, aluno_name, status, created_at)
    VALUES (?, ?, ?, 'waiting', ?)
    """, (classroom_id, "aluno-marielle", "Marielle Oliveira", now))

    # Questões de Literatura e Produção Textual
    questions_lit = json.dumps([
        {
            "id": "q1",
            "text": "Conceição Evaristo cunhou o conceito de 'Escrevivência'. Qual é a definição basilar desse conceito na literatura afro-brasileira?",
            "options": [
                "Uma técnica literária meramente ficcional desvinculada de experiências sociais.",
                "A escrita que nasce do cotidiano, das memórias, da ancestralidade e da vivência da mulher negra, não para adormecer os da casa-grande, mas para acordá-los de seus sonos injustos.",
                "Um formato de poema lírico de métrica rígida importado do parnasianismo francês.",
                "A catalogação neutra de dados demográficos sobre a população periférica."
            ],
            "correct": 1,
            "weight": 2.5
        },
        {
            "id": "q2",
            "text": "Em 'Quarto de Despejo: Diário de uma Favelada', Carolina Maria de Jesus estabelece uma metáfora crucial entre a cidade e a favela. O que representa o quarto de despejo?",
            "options": [
                "Um lugar de luxo reservado para o descanso aristocrático.",
                "A sala de visitas da sociedade burguesa paulistana.",
                "O espaço onde a sociedade joga e oculta aquilo que não deseja ver: a miséria, o povo preto e a fome produzidos pela desigualdade estrutural.",
                "Um depósito exclusivo para materiais recicláveis sem conotação social."
            ],
            "correct": 2,
            "weight": 2.5
        },
        {
            "id": "q3",
            "text": "Qual é a contribuição fundamental de Lélia Gonzalez para o pensamento feminista negro e a linguística com o conceito de 'Améfrica Ladina' e 'Pretuguês'?",
            "options": [
                "Afirmar que a língua e a cultura brasileira são profundamente moldadas pela marca de africanização e pelas línguas banto e iorubá.",
                "Defender o abandono de todas as matrizes africanas na produção acadêmica.",
                "Limitar os estudos de gênero à Europa Ocidental.",
                "Propor a tradução literal de obras inglesas sem adaptação contextual."
            ],
            "correct": 0,
            "weight": 2.5
        },
        {
            "id": "q4",
            "text": "Como a escrita pode ser compreendida enquanto tecnologia ancestral de libertação segundo o projeto Escritoras da Liberdade?",
            "options": [
                "Como um instrumento de emancipação, registro de memórias silenciadas e construção de novas narrativas de futuro e poder para a juventude negra.",
                "Como uma prática restrita aos circuitos acadêmicos tradicionais.",
                "Apenas como treino mecânico de gramática normativa sem teor crítico.",
                "Como mero entretenimento desprovido de engajamento social."
            ],
            "correct": 0,
            "weight": 2.5
        }
    ])

    questions_redacao = json.dumps([
        {
            "id": "qr1",
            "text": "Na estruturação de um ensaio dissertativo-argumentativo com recorte antirracista, qual a função da tese inicial?",
            "options": [
                "Apresentar de forma explícita o posicionamento crítico e o problema estrutural a ser defendido e fundamentado ao longo do texto.",
                "Contar uma narrativa mitológica sem argumentos lógicos.",
                "Listar apenas referências bibliográficas sem tomada de posição.",
                "Copiar integralmente os textos motivadores propostos."
            ],
            "correct": 0,
            "weight": 5.0
        },
        {
            "id": "qr2",
            "text": "Qual o papel do repertório sociocultural legitimado ao abordar as cotas raciais e a democratização do ensino superior?",
            "options": [
                "Enfraquecer a argumentação utilizando dados sem fontes confiáveis.",
                "Fundamentar a eficácia das ações afirmativas com marcos históricos, dados sociológicos e pensadores negros reconhecidos.",
                "Substituir a conclusão do texto sem apresentar proposta de intervenção.",
                "Evitar menções à história das relações raciais no Brasil."
            ],
            "correct": 1,
            "weight": 5.0
        }
    ])

    activities = [
        ("act-lit-01", "tenant-baoba-salvador", "prof-dandara", "Produção Textual 01: Memorial de Escrevivência e Ancestralidade", "ensaio", "Literatura Negra & Escrevivência", "2026-10-31", 10.0, questions_lit, now),
        ("act-red-02", "tenant-baoba-salvador", "prof-dandara", "Ensaio Crítico: Carolina Maria de Jesus e as Cidades Invisíveis", "atividade", "Literatura Negra & Escrevivência", "2026-10-27", 10.0, questions_lit, now),
        ("act-redacao-sp", "tenant-baoba-sp", "prof-sueli", "Simulado de Redação Crítica: Acesso e Permanência de Pessoas Pretas na Pós-Graduação", "prova", "Redação Crítica & Letramento Racial", "2026-10-29", 10.0, questions_redacao, now),
    ]
    cursor.executemany("INSERT INTO activities VALUES (?,?,?,?,?,?,?,?,?,?)", activities)

    # Entregas das Alunas
    submissions = [
        ("sub-marielle-1", "act-lit-01", "tenant-baoba-salvador", "aluno-marielle", "corrigido", json.dumps({"q1": 1, "q2": 2, "q3": 0, "q4": 0, "memorial_texto": "A minha escrita nasce das memórias de minha avó lavadeira e das narrativas de resistência do nosso bairro."}), 10.0, "Texto potente, comovente e profundamente fundamentado na teoria de Conceição Evaristo. Você é uma voz necessária!", now, now),
        ("sub-esperanca-1", "act-lit-01", "tenant-baoba-salvador", "aluno-esperanca", "pendente", json.dumps({"q1": 1, "q2": 2, "q3": 0, "q4": 0, "memorial_texto": "Escrevo a partir das cartas de Esperança Garcia como primeiro documento de petição jurídica da história brasileira."}), None, None, now, None),
        ("sub-aqualtune-1", "act-red-02", "tenant-baoba-salvador", "aluno-aqualtune", "pendente", json.dumps({"q1": 1, "q2": 2, "q3": 0, "q4": 1}), None, None, now, None),
        ("sub-anita-1", "act-redacao-sp", "tenant-baoba-sp", "aluno-anita", "corrigido", json.dumps({"qr1": 0, "qr2": 1}), 9.8, "Argumentação brilhante sobre a importância das bancas de heteroidentificação e bolsas de permanência. Parabéns!", now, now),
        ("sub-marielle-2", "act-red-02", "tenant-baoba-salvador", "aluno-marielle", "corrigido", json.dumps({"q1": 1, "q2": 2, "q3": 0, "q4": 0}), 9.5, "Excelente articulação entre o diário de Carolina e as periferias contemporâneas.", now, now),
    ]
    cursor.executemany("INSERT INTO submissions VALUES (?,?,?,?,?,?,?,?,?,?)", submissions)

    # Relatórios Mensais de Atividades Docentes (Bolsas e Prestação de Contas Baobá)
    reports = [
        (
            "rep-baoba-2026-10-dandara",
            "tenant-baoba-salvador",
            "prof-dandara",
            "10/2026",
            44.0,  # 44 horas
            22,    # 22 oficinas/aulas
            185,   # 185 educandas atendidas
            "Oficinas populares de Escrevivência, Literatura Negra e Redação Crítica no Polo Salvador. Condução de salas online com 84 educandas simultâneas, correção de memoriais, acompanhamento individualizado e rodas virtuais de poesia.",
            90.0,
            3960.00,
            "pendente", # Aguardando auditoria e liberação de pagamento pelo Master Baobá!
            None,
            None,
            None,
            now
        ),
        (
            "rep-baoba-2026-09-dandara",
            "tenant-baoba-salvador",
            "prof-dandara",
            "09/2026",
            40.0,
            20,
            180,
            "Módulo de Introdução às Autoras Negras Brasileiras (Maria Firmina dos Reis, Carolina Maria de Jesus e Lélia Gonzalez). 20 sessões remotas e mentorias de escrita.",
            90.0,
            3600.00,
            "pago", # Liquidado via PIX
            "Relatório integralmente auditado e aprovado pela coordenação do Fundo Baobá. Pagamento liberado.",
            "2026-10-04 15:20:00",
            "PIX-BAOBA-883920194",
            "2026-09-30 17:00:00"
        ),
        (
            "rep-baoba-2026-10-sueli",
            "tenant-baoba-sp",
            "prof-sueli",
            "10/2026",
            38.0,
            19,
            160,
            "Oficinas de Redação Argumentativa e Repertório Decolonial para o Enem e Vestibulares Públicos. Aplicação de simulados com foco na democratização do acesso à universidade.",
            95.0,
            3610.00,
            "aprovado", # Aprovado, aguardando clique de liberação de PIX pelo Master!
            "Carga horária e registros validados pela coordenação pedagógica Baobá. Liberar transferência.",
            None,
            None,
            now
        ),
        (
            "rep-baoba-2026-10-luisa",
            "tenant-baoba-rj",
            "prof-luisa",
            "10/2026",
            32.0,
            16,
            125,
            "Círculos de debates sobre Pensamento Decolonial, Cidadania e História dos Movimentos Negros na América Latina. Monitoria individual de artigos acadêmicos.",
            90.0,
            2880.00,
            "pendente",
            None,
            None,
            None,
            now
        )
    ]
    cursor.executemany("INSERT INTO teacher_monthly_reports VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", reports)

class EduTechHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path.startswith("/api/"):
            self.handle_api_get(path, query)
        else:
            file_path = os.path.join(PUBLIC_DIR, path.lstrip("/"))
            if os.path.exists(file_path) and not os.path.isdir(file_path):
                super().do_GET()
            else:
                self.path = "/index.html"
                super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body) if body else {}
            self.handle_api_post(path, data)
        else:
            self.send_error(404, "Endpoint not found")

    def send_json(self, status_code, data):
        response_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def handle_api_get(self, path, query):
        conn = get_db()
        cursor = conn.cursor()

        try:
            # 1. Tenants (Polos Baobá)
            if path == "/api/tenants":
                cursor.execute("SELECT * FROM tenants ORDER BY name ASC")
                tenants = [dict(row) for row in cursor.fetchall()]
                self.send_json(200, {"success": True, "tenants": tenants})

            # 2. Users list
            elif path == "/api/users":
                tenant_id = query.get("tenant_id", [None])[0]
                role = query.get("role", [None])[0]
                
                sql = "SELECT * FROM users WHERE 1=1"
                params = []
                if tenant_id:
                    sql += " AND (tenant_id = ? OR tenant_id IS NULL)"
                    params.append(tenant_id)
                if role:
                    sql += " AND role = ?"
                    params.append(role)

                cursor.execute(sql, params)
                users = [dict(row) for row in cursor.fetchall()]
                self.send_json(200, {"success": True, "users": users})

            # 3. Classroom details & live state (até 100 participantes)
            elif path.startswith("/api/classroom/"):
                classroom_id = path.replace("/api/classroom/", "").split("/")[0]
                cursor.execute("""
                SELECT c.*, u.name as professor_name, u.avatar as professor_avatar, t.name as tenant_name, t.badge as tenant_badge
                FROM classrooms c
                JOIN users u ON c.professor_id = u.id
                JOIN tenants t ON c.tenant_id = t.id
                WHERE c.id = ?
                """, (classroom_id,))
                row = cursor.fetchone()
                if not row:
                    self.send_json(404, {"error": "Classroom not found"})
                    return

                classroom = dict(row)

                cursor.execute("SELECT * FROM classroom_messages WHERE classroom_id = ? ORDER BY id ASC", (classroom_id,))
                messages = [dict(r) for r in cursor.fetchall()]

                cursor.execute("SELECT * FROM classroom_hand_raises WHERE classroom_id = ? AND status = 'waiting' ORDER BY id ASC", (classroom_id,))
                hand_raises = [dict(r) for r in cursor.fetchall()]

                self.send_json(200, {
                    "success": True,
                    "classroom": classroom,
                    "messages": messages,
                    "hand_raises": hand_raises
                })

            # 4. Student performance & stats
            elif path == "/api/student/performance":
                aluno_id = query.get("aluno_id", ["aluno-marielle"])[0]
                
                cursor.execute("SELECT * FROM users WHERE id = ?", (aluno_id,))
                student = cursor.fetchone()
                if not student:
                    self.send_json(404, {"error": "Student not found"})
                    return

                cursor.execute("""
                SELECT s.*, a.title as activity_title, a.type as activity_type, a.subject, a.due_date, a.max_score, u.name as professor_name
                FROM submissions s
                JOIN activities a ON s.activity_id = a.id
                JOIN users u ON a.professor_id = u.id
                WHERE s.aluno_id = ?
                ORDER BY s.submitted_at DESC
                """, (aluno_id,))
                submissions = [dict(r) for r in cursor.fetchall()]

                graded = [s for s in submissions if s["score"] is not None]
                avg_score = round(sum(s["score"] for s in graded) / len(graded), 2) if graded else 0.0

                performance_data = {
                    "student": dict(student),
                    "metrics": {
                        "average_grade": avg_score,
                        "attendance_rate": 98.0,
                        "activities_completed": len(submissions),
                        "pending_evaluations": len([s for s in submissions if s["status"] == "pendente"]),
                        "total_credit_hours": 160
                    },
                    "submissions": submissions,
                    "chart_data": {
                        "subjects": ["Literatura Negra", "Escrevivência", "Redação Crítica", "História Decolonial", "Oratória & Expressão"],
                        "grades": [9.8, 10.0, 9.5, 9.7, 9.9]
                    }
                }
                self.send_json(200, {"success": True, "data": performance_data})

            # 5. Student activities available
            elif path == "/api/student/activities":
                aluno_id = query.get("aluno_id", ["aluno-marielle"])[0]
                cursor.execute("SELECT tenant_id FROM users WHERE id = ?", (aluno_id,))
                user_row = cursor.fetchone()
                tenant_id = user_row["tenant_id"] if user_row else "tenant-baoba-salvador"

                cursor.execute("""
                SELECT a.*, u.name as professor_name,
                       (SELECT s.id FROM submissions s WHERE s.activity_id = a.id AND s.aluno_id = ?) as user_submission_id,
                       (SELECT s.score FROM submissions s WHERE s.activity_id = a.id AND s.aluno_id = ?) as user_score,
                       (SELECT s.status FROM submissions s WHERE s.activity_id = a.id AND s.aluno_id = ?) as submission_status
                FROM activities a
                JOIN users u ON a.professor_id = u.id
                WHERE a.tenant_id = ?
                ORDER BY a.due_date ASC
                """, (aluno_id, aluno_id, aluno_id, tenant_id))
                
                activities = []
                for row in cursor.fetchall():
                    item = dict(row)
                    if item.get("questions_json"):
                        item["questions"] = json.loads(item["questions_json"])
                    activities.append(item)

                self.send_json(200, {"success": True, "activities": activities})

            # 6. Professor grading dashboard
            elif path == "/api/professor/submissions":
                prof_id = query.get("professor_id", ["prof-dandara"])[0]
                cursor.execute("""
                SELECT s.*, a.title as activity_title, a.type as activity_type, a.subject, a.max_score, a.questions_json,
                       u.name as aluno_name, u.email as aluno_email, u.avatar as aluno_avatar
                FROM submissions s
                JOIN activities a ON s.activity_id = a.id
                JOIN users u ON s.aluno_id = u.id
                WHERE a.professor_id = ?
                ORDER BY CASE WHEN s.status = 'pendente' THEN 0 ELSE 1 END, s.submitted_at DESC
                """, (prof_id,))
                
                rows = []
                for r in cursor.fetchall():
                    d = dict(r)
                    if d.get("answers_json"):
                        d["answers"] = json.loads(d["answers_json"])
                    if d.get("questions_json"):
                        d["questions"] = json.loads(d["questions_json"])
                    rows.append(d)

                self.send_json(200, {"success": True, "submissions": rows})

            # 7. Professor reports
            elif path == "/api/professor/reports":
                prof_id = query.get("professor_id", ["prof-dandara"])[0]
                cursor.execute("""
                SELECT r.*, t.name as tenant_name
                FROM teacher_monthly_reports r
                JOIN tenants t ON r.tenant_id = t.id
                WHERE r.professor_id = ?
                ORDER BY r.created_at DESC
                """, (prof_id,))
                reports = [dict(r) for r in cursor.fetchall()]
                self.send_json(200, {"success": True, "reports": reports})

            # 8. Master Hub - All Reports & Payments (Fundo Baobá)
            elif path == "/api/master/reports":
                tenant_id = query.get("tenant_id", [None])[0]
                status = query.get("status", [None])[0]

                sql = """
                SELECT r.*, t.name as tenant_name, t.badge as tenant_badge, u.name as professor_name, u.email as professor_email, u.avatar as professor_avatar, u.discipline
                FROM teacher_monthly_reports r
                JOIN tenants t ON r.tenant_id = t.id
                JOIN users u ON r.professor_id = u.id
                WHERE 1=1
                """
                params = []
                if tenant_id and tenant_id != "all":
                    sql += " AND r.tenant_id = ?"
                    params.append(tenant_id)
                if status and status != "all":
                    sql += " AND r.status = ?"
                    params.append(status)

                sql += " ORDER BY CASE WHEN r.status = 'pendente' THEN 0 WHEN r.status = 'aprovado' THEN 1 ELSE 2 END, r.created_at DESC"

                cursor.execute(sql, params)
                reports = [dict(r) for r in cursor.fetchall()]

                # Financial aggregates
                cursor.execute("""
                SELECT 
                    SUM(CASE WHEN status = 'pago' THEN total_amount ELSE 0 END) as total_pago,
                    SUM(CASE WHEN status IN ('pendente', 'aprovado') THEN total_amount ELSE 0 END) as total_pendente,
                    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as count_pendentes,
                    COUNT(CASE WHEN status = 'pago' THEN 1 END) as count_pagos
                FROM teacher_monthly_reports
                """)
                stats = dict(cursor.fetchone())

                self.send_json(200, {"success": True, "reports": reports, "stats": stats})

            # 9. Master Overview
            elif path == "/api/master/overview":
                cursor.execute("SELECT * FROM tenants")
                tenants = [dict(r) for r in cursor.fetchall()]

                cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'aluno'")
                total_alunos = cursor.fetchone()["cnt"]

                cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'professor'")
                total_profs = cursor.fetchone()["cnt"]

                cursor.execute("SELECT COUNT(*) as cnt FROM classrooms WHERE status = 'active'")
                active_rooms = cursor.fetchone()["cnt"]

                self.send_json(200, {
                    "success": True,
                    "overview": {
                        "total_tenants": len(tenants),
                        "total_alunos": total_alunos,
                        "total_profs": total_profs,
                        "active_rooms": active_rooms,
                        "tenants": tenants
                    }
                })

            else:
                self.send_json(404, {"error": "API route not found"})

        except Exception as e:
            self.send_json(500, {"error": str(e)})
        finally:
            conn.close()

    def handle_api_post(self, path, data):
        conn = get_db()
        cursor = conn.cursor()
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            # 1. Post message in classroom
            if path == "/api/classroom/message":
                classroom_id = data.get("classroom_id")
                user_id = data.get("user_id")
                user_name = data.get("user_name")
                role = data.get("role", "aluno")
                message = data.get("message", "").strip()

                if not message:
                    self.send_json(400, {"error": "Message cannot be empty"})
                    return

                cursor.execute("""
                INSERT INTO classroom_messages (classroom_id, user_id, user_name, role, message, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (classroom_id, user_id, user_name, role, message, now))
                conn.commit()

                cursor.execute("SELECT * FROM classroom_messages WHERE classroom_id = ? ORDER BY id ASC", (classroom_id,))
                messages = [dict(r) for r in cursor.fetchall()]
                self.send_json(200, {"success": True, "messages": messages})

            # 2. Raise hand
            elif path == "/api/classroom/raise-hand":
                classroom_id = data.get("classroom_id")
                aluno_id = data.get("aluno_id")
                aluno_name = data.get("aluno_name")

                cursor.execute("SELECT id FROM classroom_hand_raises WHERE classroom_id = ? AND aluno_id = ? AND status = 'waiting'", (classroom_id, aluno_id))
                if not cursor.fetchone():
                    cursor.execute("""
                    INSERT INTO classroom_hand_raises (classroom_id, aluno_id, aluno_name, status, created_at)
                    VALUES (?, ?, ?, 'waiting', ?)
                    """, (classroom_id, aluno_id, aluno_name, now))
                    conn.commit()

                cursor.execute("SELECT * FROM classroom_hand_raises WHERE classroom_id = ? AND status = 'waiting' ORDER BY id ASC", (classroom_id,))
                hand_raises = [dict(r) for r in cursor.fetchall()]
                self.send_json(200, {"success": True, "hand_raises": hand_raises})

            # 3. Lower hand
            elif path == "/api/classroom/lower-hand":
                hand_id = data.get("id")
                classroom_id = data.get("classroom_id")
                cursor.execute("UPDATE classroom_hand_raises SET status = 'answered' WHERE id = ?", (hand_id,))
                conn.commit()

                cursor.execute("SELECT * FROM classroom_hand_raises WHERE classroom_id = ? AND status = 'waiting' ORDER BY id ASC", (classroom_id,))
                hand_raises = [dict(r) for r in cursor.fetchall()]
                self.send_json(200, {"success": True, "hand_raises": hand_raises})

            # 4. Aluno: Submit Activity / Exam
            elif path == "/api/student/submit-activity":
                activity_id = data.get("activity_id")
                aluno_id = data.get("aluno_id")
                tenant_id = data.get("tenant_id", "tenant-baoba-salvador")
                answers = data.get("answers", {})

                cursor.execute("SELECT * FROM activities WHERE id = ?", (activity_id,))
                act = cursor.fetchone()
                if not act:
                    self.send_json(404, {"error": "Activity not found"})
                    return

                questions = json.loads(act["questions_json"]) if act["questions_json"] else []
                total_weight = 0
                earned_weight = 0

                for q in questions:
                    q_id = q.get("id")
                    correct_idx = q.get("correct")
                    weight = float(q.get("weight", 1.0))
                    total_weight += weight
                    if str(answers.get(q_id)) == str(correct_idx):
                        earned_weight += weight

                calculated_score = round((earned_weight / total_weight) * act["max_score"], 1) if total_weight > 0 else 9.0
                
                cursor.execute("SELECT id FROM submissions WHERE activity_id = ? AND aluno_id = ?", (activity_id, aluno_id))
                existing = cursor.fetchone()

                sub_id = existing["id"] if existing else f"sub-{datetime.datetime.now().strftime('%f')}"
                if existing:
                    cursor.execute("""
                    UPDATE submissions 
                    SET answers_json = ?, status = 'pendente', submitted_at = ?, score = ?, feedback = NULL
                    WHERE id = ?
                    """, (json.dumps(answers), now, calculated_score, sub_id))
                else:
                    cursor.execute("""
                    INSERT INTO submissions (id, activity_id, tenant_id, aluno_id, status, answers_json, score, submitted_at)
                    VALUES (?, ?, ?, ?, 'pendente', ?, ?, ?)
                    """, (sub_id, activity_id, tenant_id, aluno_id, json.dumps(answers), calculated_score, now))

                conn.commit()
                self.send_json(200, {"success": True, "submission_id": sub_id, "score": calculated_score, "status": "pendente"})

            # 5. Professor: Grade and Evaluate
            elif path == "/api/professor/grade-submission":
                sub_id = data.get("submission_id")
                score = float(data.get("score", 0.0))
                feedback = data.get("feedback", "").strip()

                cursor.execute("""
                UPDATE submissions
                SET score = ?, feedback = ?, status = 'corrigido', graded_at = ?
                WHERE id = ?
                """, (score, feedback, now, sub_id))
                conn.commit()

                self.send_json(200, {"success": True, "message": "Avaliação pedagógica gravada com sucesso!"})

            # 6. Professor: Submit Monthly Report
            elif path == "/api/professor/submit-report":
                prof_id = data.get("professor_id")
                tenant_id = data.get("tenant_id", "tenant-baoba-salvador")
                month_ref = data.get("month_ref")
                hours_taught = float(data.get("hours_taught", 0))
                classes_count = int(data.get("classes_count", 0))
                students_assisted = int(data.get("students_assisted", 0))
                description = data.get("description", "").strip()
                hourly_rate = float(data.get("hourly_rate", 90.0))
                total_amount = round(hours_taught * hourly_rate, 2)

                rep_id = f"rep-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{prof_id}"

                cursor.execute("""
                INSERT INTO teacher_monthly_reports 
                (id, tenant_id, professor_id, month_ref, hours_taught, classes_count, students_assisted, description, hourly_rate, total_amount, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?)
                """, (rep_id, tenant_id, prof_id, month_ref, hours_taught, classes_count, students_assisted, description, hourly_rate, total_amount, now))
                conn.commit()

                self.send_json(200, {"success": True, "report_id": rep_id, "total_amount": total_amount})

            # 7. Master: Review Report
            elif path == "/api/master/review-report":
                report_id = data.get("report_id")
                status = data.get("status")
                feedback = data.get("feedback", "")

                cursor.execute("""
                UPDATE teacher_monthly_reports
                SET status = ?, master_feedback = ?
                WHERE id = ?
                """, (status, feedback, report_id))
                conn.commit()

                self.send_json(200, {"success": True, "message": f"Relatório atualizado para: {status}"})

            # 8. Master: Release Payment (Fundo Baobá)
            elif path == "/api/master/release-payment":
                report_id = data.get("report_id")
                payment_ref = data.get("payment_reference", f"PIX-BAOBA-{datetime.datetime.now().strftime('%d%H%M%S')}")

                cursor.execute("""
                UPDATE teacher_monthly_reports
                SET status = 'pago', payment_date = ?, payment_reference = ?
                WHERE id = ?
                """, (now, payment_ref, report_id))
                conn.commit()

                self.send_json(200, {
                    "success": True,
                    "message": "Bolsa/pagamento liberado e transferido via PIX com sucesso!",
                    "payment_date": now,
                    "payment_reference": payment_ref
                })

            else:
                self.send_json(404, {"error": "API route not found"})

        except Exception as e:
            self.send_json(500, {"error": str(e)})
        finally:
            conn.close()

def run_server(port=8000):
    init_db()
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, EduTechHandler)
    print(f"================================================================")
    print(f" [Escritoras da Liberdade - Projeto Baobá] Servidor Ativo: http://localhost:{port}")
    print(f" Programa Popular de Ensino para Pessoas Pretas")
    print(f" Multi-tenant (Polos Baobá), Sala de Aula (até 100 participantes),")
    print(f" Escrevivência, Desempenho, Correções e Liberação de Bolsas/PIX.")
    print(f"================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor finalizado com sucesso.")
        httpd.server_close()

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
