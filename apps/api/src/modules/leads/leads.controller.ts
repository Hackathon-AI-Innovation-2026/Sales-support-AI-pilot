import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { GetLeadsQueryDto } from './dtos/get-leads-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { type User } from '@prisma/client';
import { LeadScoringService } from './lead-scoring.service';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  @Post()
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: User,
  ) {
    return this.leadsService.create(createLeadDto, user);
  }

  @Get()
  async findAll(@Query() query: GetLeadsQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.leadsService.softDelete(id);
  }

  @Post(':id/score')
  async scoreLead(@Param('id') id: string) {
    return this.leadScoringService.scoreLead(id);
  }

  @Get(':id/scores')
  async getScoreHistory(@Param('id') id: string) {
    return this.leadScoringService.getScoreHistory(id);
  }

  @Get(':id/score')
  async getLatestScore(@Param('id') id: string) {
    return this.leadScoringService.getLatestScore(id);
  }
}
