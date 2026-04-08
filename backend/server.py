from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    amount: int
    description: str
    type: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    class_id: str
    class_year: str = ""
    balance: int = 0
    password: str = "1234"


class StudentWithTransactions(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    class_year: str
    balance: int
    transactions: List[Transaction] = []


class Benefit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    cost: int
    image_url: str


class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    reward: int
    image_url: str


class AdminVerify(BaseModel):
    password: str


class GamaOperation(BaseModel):
    amount: int
    description: str
    operation: str


class BankBalance(BaseModel):
    balance: int


class ClassRoom(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    year: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


ADMIN_PASSWORD = "Rodrigo123"


@api_router.get("/")
async def root():
    return {"message": "Gama Bank API"}


@api_router.post("/admin/verify")
async def verify_admin(data: AdminVerify):
    global ADMIN_PASSWORD
    if data.password == ADMIN_PASSWORD:
        return {"success": True, "message": "Admin autenticado"}
    raise HTTPException(status_code=401, detail="Senha incorreta")


@api_router.post("/admin/change-password")
async def change_password(data: PasswordChange):
    global ADMIN_PASSWORD
    if data.current_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Senha atual incorreta")
    ADMIN_PASSWORD = data.new_password
    return {"success": True, "message": "Senha alterada"}


@api_router.post("/student/login")
async def student_login(data: dict):
    student = await db.students.find_one({
        "id": data["student_id"],
        "password": data["password"]
    }, {"_id": 0})
    if not student:
        raise HTTPException(status_code=401, detail="Senha incorreta")
    return {"success": True, "student": student}


@api_router.put("/admin/students/{student_id}/password")
async def update_student_password(student_id: str, data: dict):
    await db.students.update_one({"id": student_id}, {"$set": {"password": data["password"]}})
    return {"success": True}


@api_router.post("/student/transfer")
async def student_transfer(data: dict):
    from_student = await db.students.find_one({"id": data["from_student_id"]}, {"_id": 0})
    to_student = await db.students.find_one({"id": data["to_student_id"]}, {"_id": 0})
    
    if not from_student or not to_student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    amount = data["amount"]
    if from_student["balance"] < amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    await db.students.update_one({"id": data["from_student_id"]}, {"$inc": {"balance": -amount}})
    await db.students.update_one({"id": data["to_student_id"]}, {"$inc": {"balance": amount}})
    
    trans_from = Transaction(
        student_id=data["from_student_id"],
        amount=amount,
        description=f"Transferência para {to_student['name']}: {data['description']}",
        type="subtract"
    )
    trans_to = Transaction(
        student_id=data["to_student_id"],
        amount=amount,
        description=f"Transferência de {from_student['name']}: {data['description']}",
        type="add"
    )
    
    await db.transactions.insert_one(trans_from.model_dump())
    await db.transactions.insert_one(trans_to.model_dump())
    
    return {"success": True}


@api_router.get("/classes")
async def get_classes():
    classes = await db.classes.find({}, {"_id": 0}).to_list(1000)
    if not classes:
        default = [
            {"id": str(uuid.uuid4()), "name": "8º Ano", "year": "8"},
            {"id": str(uuid.uuid4()), "name": "9º Ano", "year": "9"},
            {"id": str(uuid.uuid4()), "name": "1º Colegial", "year": "1"}
        ]
        await db.classes.insert_many(default)
        return default
    return classes


@api_router.post("/admin/classes")
async def create_class(data: dict):
    class_obj = ClassRoom(**data)
    await db.classes.insert_one(class_obj.model_dump())
    return {"success": True}


@api_router.put("/admin/classes/{class_id}")
async def update_class(class_id: str, data: dict):
    await db.classes.update_one({"id": class_id}, {"$set": data})
    return {"success": True}


@api_router.delete("/admin/classes/{class_id}")
async def delete_class(class_id: str):
    result = await db.classes.delete_one({"id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return {"success": True}


@api_router.get("/students", response_model=List[Student])
async def get_all_students():
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    return students


@api_router.get("/students/class/{class_year}", response_model=List[Student])
async def get_students_by_class(class_year: str):
    students = await db.students.find({"class_year": class_year}, {"_id": 0}).to_list(1000)
    return students


@api_router.get("/students/classid/{class_id}")
async def get_students_by_class_id(class_id: str):
    students = await db.students.find({"class_id": class_id}, {"_id": 0}).to_list(1000)
    return students


@api_router.get("/students/{student_id}", response_model=StudentWithTransactions)
async def get_student_detail(student_id: str):
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    transactions = await db.transactions.find(
        {"student_id": student_id}, 
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    
    return {
        **student,
        "transactions": transactions
    }


@api_router.post("/admin/students/{student_id}/gamas")
async def update_student_gamas(student_id: str, operation: GamaOperation):
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    amount_change = operation.amount if operation.operation == "add" else -operation.amount
    new_balance = student["balance"] + amount_change
    
    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    await db.students.update_one(
        {"id": student_id},
        {"$set": {"balance": new_balance}}
    )
    
    transaction = Transaction(
        student_id=student_id,
        amount=operation.amount,
        description=operation.description,
        type=operation.operation
    )
    
    await db.transactions.insert_one(transaction.model_dump())
    
    bank = await db.bank.find_one({}, {"_id": 0})
    if bank:
        bank_change = -amount_change
        new_bank = bank["balance"] + bank_change
        await db.bank.update_one({}, {"$set": {"balance": new_bank}})
    
    return {
        "success": True,
        "new_balance": new_balance,
        "transaction": transaction
    }


@api_router.get("/bank")
async def get_bank_balance():
    bank = await db.bank.find_one({}, {"_id": 0})
    if not bank:
        await db.bank.insert_one({"balance": 10000})
        return {"balance": 10000}
    return bank


@api_router.put("/admin/bank")
async def update_bank_balance(data: BankBalance):
    await db.bank.update_one({}, {"$set": {"balance": data.balance}}, upsert=True)
    return {"success": True, "balance": data.balance}


@api_router.post("/admin/students")
async def create_student(data: dict):
    student = Student(**data)
    doc = student.model_dump()
    await db.students.insert_one(doc)
    return {"success": True, "student": student}


@api_router.put("/admin/students/{student_id}")
async def update_student(student_id: str, data: dict):
    await db.students.update_one({"id": student_id}, {"$set": data})
    return {"success": True}


@api_router.delete("/admin/students/{student_id}")
async def delete_student(student_id: str):
    result = await db.students.delete_one({"id": student_id})
    await db.transactions.delete_many({"student_id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return {"success": True}


@api_router.get("/students/class/{class_id}")
async def get_students_by_class_id(class_id: str):
    students = await db.students.find({"class_id": class_id}, {"_id": 0}).to_list(1000)
    return students


@api_router.post("/admin/migrate-students")
async def migrate_students():
    classes_list = await db.classes.find({}, {"_id": 0}).to_list(1000)
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    
    updated = 0
    for student in students:
        if "class_id" not in student or not student.get("class_id"):
            class_year = student.get("class_year", "")
            matching_class = next((c for c in classes_list if c.get("year") == class_year), None)
            
            if matching_class:
                await db.students.update_one(
                    {"id": student["id"]},
                    {"$set": {"class_id": matching_class["id"]}}
                )
                updated += 1
    
    return {"message": f"Migração concluída! {updated} alunos atualizados."}


@api_router.get("/benefits", response_model=List[Benefit])
async def get_benefits():
    benefits = await db.benefits.find({}, {"_id": 0}).to_list(1000)
    return benefits


@api_router.post("/admin/benefits")
async def create_benefit(data: dict):
    benefit = Benefit(**data)
    doc = benefit.model_dump()
    await db.benefits.insert_one(doc)
    return {"success": True, "benefit": benefit}


@api_router.put("/admin/benefits/{benefit_id}")
async def update_benefit(benefit_id: str, data: dict):
    await db.benefits.update_one({"id": benefit_id}, {"$set": data})
    return {"success": True}


@api_router.delete("/admin/benefits/{benefit_id}")
async def delete_benefit(benefit_id: str):
    result = await db.benefits.delete_one({"id": benefit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Benefício não encontrado")
    return {"success": True}


@api_router.get("/activities", response_model=List[Activity])
async def get_activities():
    activities = await db.activities.find({}, {"_id": 0}).to_list(1000)
    return activities


@api_router.post("/admin/activities")
async def create_activity(data: dict):
    activity = Activity(**data)
    doc = activity.model_dump()
    await db.activities.insert_one(doc)
    return {"success": True, "activity": activity}


@api_router.put("/admin/activities/{activity_id}")
async def update_activity(activity_id: str, data: dict):
    await db.activities.update_one({"id": activity_id}, {"$set": data})
    return {"success": True}


@api_router.delete("/admin/activities/{activity_id}")
async def delete_activity(activity_id: str):
    result = await db.activities.delete_one({"id": activity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Atividade não encontrada")
    return {"success": True}


@api_router.get("/transactions")
async def get_all_transactions():
    transactions = await db.transactions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for t in transactions:
        student = await db.students.find_one({"id": t["student_id"]}, {"_id": 0, "name": 1})
        t["student_name"] = student["name"] if student else "Desconhecido"
    return transactions


@api_router.put("/admin/transactions/{transaction_id}")
async def update_transaction(transaction_id: str, data: dict):
    await db.transactions.update_one({"id": transaction_id}, {"$set": data})
    return {"success": True}


@api_router.delete("/admin/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    result = await db.transactions.delete_one({"id": transaction_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return {"success": True}


@api_router.post("/seed")
async def seed_database():
    existing_students = await db.students.count_documents({})
    if existing_students > 0:
        raise HTTPException(status_code=400, detail="Banco já possui dados! Use /api/force-reset para resetar (cuidado!)")
    
    await db.bank.delete_many({})
    await db.bank.insert_one({"balance": 10000})
    
    students = [
        {"id": str(uuid.uuid4()), "name": "Guilherme", "class_id": "", "class_year": "8", "balance": 45, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Chade", "class_id": "", "class_year": "8", "balance": 62, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Heitor", "class_id": "", "class_year": "8", "balance": 38, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Pietro", "class_id": "", "class_year": "9", "balance": 78, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Maria Eduarda", "class_id": "", "class_year": "9", "balance": 95, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Izabella", "class_id": "", "class_year": "9", "balance": 83, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Livia", "class_id": "", "class_year": "9", "balance": 70, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Hetore", "class_id": "", "class_year": "9", "balance": 56, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Paula", "class_id": "", "class_year": "9", "balance": 88, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Maria Helena", "class_id": "", "class_year": "9", "balance": 92, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Ana", "class_id": "", "class_year": "1", "balance": 110, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Anne", "class_id": "", "class_year": "1", "balance": 105, "password": "1234"},
        {"id": str(uuid.uuid4()), "name": "Otavio", "class_id": "", "class_year": "1", "balance": 98, "password": "1234"}
    ]
    
    await db.students.insert_many(students)
    
    await axios.post(f"{os.environ.get('API_URL', 'http://localhost:8001')}/api/admin/migrate-students")
    
    benefits = [
        {
            "id": str(uuid.uuid4()),
            "name": "Refazer Questão da Prova",
            "description": "Escolha uma questão da prova para refazer e ganhar pontos extras",
            "cost": 50,
            "image_url": "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Escolher Lugar na Sala",
            "description": "Escolha onde você quer sentar na sala por 1 semana",
            "cost": 30,
            "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Não Fazer Lição de Casa",
            "description": "Pule uma lição de casa sem perder pontos",
            "cost": 100,
            "image_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Apresentar Trabalho em Grupo",
            "description": "Converta uma apresentação individual em grupo",
            "cost": 75,
            "image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Atraso Livre",
            "description": "Chegue até 15 minutos atrasado sem justificativa",
            "cost": 40,
            "image_url": "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Escolher Tema da Redação",
            "description": "Sugira o tema da próxima redação",
            "cost": 60,
            "image_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400"
        }
    ]
    
    await db.benefits.insert_many(benefits)
    
    activities = [
        {
            "id": str(uuid.uuid4()),
            "name": "Ler Texto da Apostila",
            "description": "Leia o texto indicado da apostila e responda as questões",
            "reward": 10,
            "image_url": "https://images.unsplash.com/photo-1645891913640-9a75931c6235?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Participar Ativamente da Aula",
            "description": "Faça perguntas e participe das discussões em aula",
            "reward": 5,
            "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Trazer Apostila Completa",
            "description": "Traga sua apostila com todas as atividades feitas",
            "reward": 15,
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ajudar Colega com Dúvidas",
            "description": "Ajude um colega a entender a matéria",
            "reward": 8,
            "image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Entregar Trabalho no Prazo",
            "description": "Entregue seu trabalho até a data limite",
            "reward": 12,
            "image_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Criar Resumo da Aula",
            "description": "Faça um resumo criativo do conteúdo da aula",
            "reward": 20,
            "image_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400"
        }
    ]
    
    await db.activities.insert_many(activities)
    
    return {"message": "Banco de dados inicial criado com sucesso! Dados agora estão protegidos."}


@api_router.post("/admin/force-reset")
async def force_reset_database(data: AdminVerify):
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Senha admin incorreta")
    
    await db.students.delete_many({})
    await db.transactions.delete_many({})
    await db.benefits.delete_many({})
    await db.activities.delete_many({})
    await db.bank.delete_many({})
    
    return {"message": "Banco resetado! Use /api/seed para popular novamente."}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
