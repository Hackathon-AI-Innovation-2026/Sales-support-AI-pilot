class PromptBuilder:
    @staticmethod
    def build_email_prompt(customer_name: str, age: int, income: float, city: str, product_name: str, lead_score: int, probability: float, top_features: list[str], retrieved_context: str) -> str:
        # TODO: Format email prompt with templates
        return ""

    @staticmethod
    def build_pitch_prompt(customer_name: str, lead_score: int, product_name: str, confidence: float, product_reason: str, retrieved_context: str) -> str:
        # TODO: Format pitch prompt with templates
        return ""

    @staticmethod
    def build_chat_prompt(customer_context: str, retrieved_context: str, conversation_history: str, message: str) -> str:
        # TODO: Format chat prompt with templates
        return ""

    @staticmethod
    def build_nba_prompt(lead_score: int, probability: float, recent_interactions: str, interested_product: str, retrieved_context: str, action: str, priority: str) -> str:
        # TODO: Format NBA prompt with templates
        return ""
