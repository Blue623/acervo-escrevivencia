import unicodedata

def normalizar_texto(texto: str) -> str:
    """
    Remove acentos, converte para minúsculas e remove espaços extras.
    Exemplo: '  Pérola de Jasmim! ' -> 'perola de jasmim!'
    """
    if not texto:
        return ""
    # Decompõe caracteres acentuados
    texto_sem_acento = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    return texto_sem_acento.strip().lower()