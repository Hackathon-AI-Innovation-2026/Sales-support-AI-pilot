-- CreateIndex
CREATE INDEX "Customer_city_idx" ON "Customer"("city");

-- CreateIndex
CREATE INDEX "Customer_income_idx" ON "Customer"("income");

-- CreateIndex
CREATE INDEX "Customer_fullName_idx" ON "Customer"("fullName");

-- CreateIndex
CREATE INDEX "CustomerInteraction_customerId_interactionType_idx" ON "CustomerInteraction"("customerId", "interactionType");

-- CreateIndex
CREATE INDEX "CustomerInteraction_customerId_occurredAt_idx" ON "CustomerInteraction"("customerId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "CustomerInteraction_occurredAt_idx" ON "CustomerInteraction"("occurredAt" DESC);

-- CreateIndex
CREATE INDEX "CustomerProduct_customerId_idx" ON "CustomerProduct"("customerId");

-- CreateIndex
CREATE INDEX "CustomerProduct_customerId_productType_idx" ON "CustomerProduct"("customerId", "productType");

-- CreateIndex
CREATE INDEX "CustomerProduct_status_idx" ON "CustomerProduct"("status");

-- CreateIndex
CREATE INDEX "GeneratedContent_leadId_idx" ON "GeneratedContent"("leadId");

-- CreateIndex
CREATE INDEX "GeneratedContent_leadId_type_idx" ON "GeneratedContent"("leadId", "type");

-- CreateIndex
CREATE INDEX "GeneratedContent_leadId_createdAt_idx" ON "GeneratedContent"("leadId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Lead_assignedTo_status_idx" ON "Lead"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "ProductRecommendation_leadId_idx" ON "ProductRecommendation"("leadId");

-- CreateIndex
CREATE INDEX "ProductRecommendation_leadId_generatedAt_idx" ON "ProductRecommendation"("leadId", "generatedAt" DESC);

-- CreateIndex
CREATE INDEX "Recommendation_leadId_idx" ON "Recommendation"("leadId");

-- CreateIndex
CREATE INDEX "Recommendation_leadId_priority_idx" ON "Recommendation"("leadId", "priority");

-- CreateIndex
CREATE INDEX "Recommendation_leadId_generatedAt_idx" ON "Recommendation"("leadId", "generatedAt" DESC);

-- CreateIndex
CREATE INDEX "SalesTask_leadId_idx" ON "SalesTask"("leadId");

-- CreateIndex
CREATE INDEX "SalesTask_assignedTo_status_idx" ON "SalesTask"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "SalesTask_status_dueDate_idx" ON "SalesTask"("status", "dueDate");
