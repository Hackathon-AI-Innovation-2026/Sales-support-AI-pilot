from app.config import settings
from app.prompt.templates import EMAIL_TEMPLATE, PITCH_TEMPLATE, CHAT_TEMPLATE, NBA_TEMPLATE

class PromptBuilder:
    @staticmethod
    def _sanitize_string(val: any, default: str = "Không có thông tin") -> str:
        if val is None or val == "":
            return default
        # If it's a list, join it
        if isinstance(val, list):
            val = ", ".join(str(item) for item in val)
        # Convert to string and escape curly braces
        return str(val).replace("{", "{{").replace("}", "}}")

    @staticmethod
    def _truncate_context(documents: list, max_chars: int = None) -> str:
        if not documents:
            return "Không tìm thấy tài liệu liên quan."
        
        limit = max_chars or settings.MAX_CONTEXT_CHARACTERS
        selected = []
        current_len = 0
        
        for doc in documents:
            # Support both Document objects and dicts
            if hasattr(doc, 'content'):
                content = doc.content
            elif isinstance(doc, dict):
                content = doc.get('content', '')
            else:
                content = str(doc)
                
            if not content:
                continue
                
            separator = "\n\n" if selected else ""
            added_len = len(content) + len(separator)
            
            if current_len + added_len <= limit:
                selected.append(content)
                current_len += added_len
            else:
                remaining = limit - current_len - len(separator)
                if remaining > 100:
                    selected.append(content[:remaining] + "... [cắt bớt do vượt quá giới hạn]")
                break
                
        return "\n\n".join(selected)

    @staticmethod
    def build_email_prompt(
        customer_name: str,
        age: int,
        income: float,
        city: str,
        product_name: str,
        lead_score: int,
        probability: float,
        top_features: list[str],
        documents: list
    ) -> str:
        # Sanitize string inputs
        cust_name = PromptBuilder._sanitize_string(customer_name, "Khách hàng")
        cust_city = PromptBuilder._sanitize_string(city, "Chưa xác định")
        prod_name = PromptBuilder._sanitize_string(product_name, "Sản phẩm")
        
        # Convert numeric values safely
        try:
            income_val = int(float(income)) if income is not None else 0
        except (ValueError, TypeError):
            income_val = 0
            
        try:
            prob_val = float(probability) if probability is not None else 0.0
        except (ValueError, TypeError):
            prob_val = 0.0
            
        score_val = lead_score if lead_score is not None else 0
        age_val = age if age is not None else "Chưa xác định"
        
        # Process list
        features = ", ".join(top_features) if top_features else "Chưa xác định"
        features_sanitized = PromptBuilder._sanitize_string(features)
        
        # Format context
        context = PromptBuilder._truncate_context(documents)
        
        return EMAIL_TEMPLATE.format(
            customer_name=cust_name,
            age=age_val,
            income=income_val,
            city=cust_city,
            product_name=prod_name,
            lead_score=score_val,
            probability=prob_val,
            top_features=features_sanitized,
            retrieved_context=context
        )

    @staticmethod
    def build_pitch_prompt(
        customer_name: str,
        lead_score: int,
        product_name: str,
        confidence: float,
        product_reason: str,
        documents: list
    ) -> str:
        # Sanitize string inputs
        cust_name = PromptBuilder._sanitize_string(customer_name, "Khách hàng")
        prod_name = PromptBuilder._sanitize_string(product_name, "Sản phẩm")
        reason = PromptBuilder._sanitize_string(product_reason, "Chưa xác định")
        
        # Convert numeric values safely
        try:
            conf_val = float(confidence) if confidence is not None else 0.0
        except (ValueError, TypeError):
            conf_val = 0.0
            
        score_val = lead_score if lead_score is not None else 0
        context = PromptBuilder._truncate_context(documents)
        
        return PITCH_TEMPLATE.format(
            customer_name=cust_name,
            lead_score=score_val,
            product_name=prod_name,
            confidence=conf_val,
            product_reason=reason,
            retrieved_context=context
        )

    @staticmethod
    def build_chat_prompt(
        customer_context: str,
        retrieved_context: list,
        conversation_history: str,
        message: str
    ) -> str:
        # Sanitize string inputs
        cust_ctx = PromptBuilder._sanitize_string(customer_context, "Không có thông tin")
        history = PromptBuilder._sanitize_string(conversation_history, "Không có lịch sử")
        msg = PromptBuilder._sanitize_string(message, "")
        context = PromptBuilder._truncate_context(retrieved_context)
        
        return CHAT_TEMPLATE.format(
            customer_context=cust_ctx,
            retrieved_context=context,
            conversation_history=history,
            message=msg
        )

    @staticmethod
    def build_nba_prompt(
        lead_score: int,
        probability: float,
        recent_interactions: str,
        interested_product: str,
        action: str,
        priority: str,
        documents: list
    ) -> str:
        # Sanitize string inputs
        interactions = PromptBuilder._sanitize_string(recent_interactions, "Không có tương tác gần đây")
        product = PromptBuilder._sanitize_string(interested_product, "Chưa xác định")
        act = PromptBuilder._sanitize_string(action, "Chờ theo dõi")
        pri = PromptBuilder._sanitize_string(priority, "Thấp")
        
        # Convert numeric values safely
        try:
            prob_val = float(probability) if probability is not None else 0.0
        except (ValueError, TypeError):
            prob_val = 0.0
            
        score_val = lead_score if lead_score is not None else 0
        context = PromptBuilder._truncate_context(documents)
        
        return NBA_TEMPLATE.format(
            lead_score=score_val,
            probability=prob_val,
            recent_interactions=interactions,
            interested_product=product,
            retrieved_context=context,
            action=act,
            priority=pri
        )
