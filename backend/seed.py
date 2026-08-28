# backend/seed.py
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "acervo_escape.db")

MEMORIAS_INICIAIS = [
    {
        "titulo": "Registro #01: O Apito e o Afeto",
        "personagem": "Pérola",
        "chave_secreta": "trilho",
        "conteudo_bloqueado": "Um relato sobre o início das andanças de Fio Jasmim.",
        "conteudo_revelado": "Pérola conhecia o som do trem antes mesmo de avistar a fumaça. Fio Jasmim trazia o mundo nos bolsos, mas nunca fincava raízes suficientes para a colheita.",
        "pista_proximo_passo": "Vá até o mapa ferroviário na parede leste e procure o nome da segunda estação.",
        "ordem": 1
    },
    {
        "titulo": "Registro #02: A Mala de Papelão",
        "personagem": "Juventina",
        "chave_secreta": "esperanca",
        "conteudo_bloqueado": "As promessas guardadas entre tecidos e cartas antigas.",
        "conteudo_revelado": "Juventina não guardava mágoa, guardava memórias em caixas de fósforo. Para ela, o amor de menino grande era feito de canções de ninar que acordavam a solidão.",
        "pista_proximo_passo": "Procure o livro de capa azul na estante e abra na página marcada com uma fita vermelha.",
        "ordem": 2
    },
    {
        "titulo": "Registro #03: O Canto Noturno",
        "personagem": "Maria-Nova",
        "chave_secreta": "escrevivencia",
        "conteudo_bloqueado": "O registro das vozes que tecem a história coletiva.",
        "conteudo_revelado": "A nossa história não é silêncio, é eco que atravessa gerações. Fio Jasmim foi rio, mas as mulheres foram o leito que sustentou a correnteza.",
        "pista_proximo_passo": "A senha final da porta do Escape Room é o ano de publicação da primeira edição do livro somado ao total de memórias catalogadas.",
        "ordem": 3
    }
]

def popular_banco():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        for m in MEMORIAS_INICIAIS:
            cursor.execute("""
                INSERT INTO memorias (titulo, personagem, chave_secreta, conteudo_bloqueado, conteudo_revelado, pista_proximo_passo, ordem)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                m["titulo"],
                m["personagem"],
                m["chave_secreta"],
                m["conteudo_bloqueado"],
                m["conteudo_revelado"],
                m["pista_proximo_passo"],
                m["ordem"]
            ))
        conn.commit()
    print("Banco de dados populado com sucesso!")

if __name__ == "__main__":
    popular_banco()