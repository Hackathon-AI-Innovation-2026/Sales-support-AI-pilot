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

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

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
}
