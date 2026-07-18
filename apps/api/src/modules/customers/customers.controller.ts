import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { GetCustomersQueryDto } from './dtos/get-customers-query.dto';
import { GetCustomerInteractionsQueryDto } from './dtos/get-customer-interactions-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, type User } from '@prisma/client';
import { LogInteractionDto } from './dtos/log-interaction.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  async findAll(@Query() query: GetCustomersQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: string) {
    return this.customersService.softDelete(id);
  }

  @Get(':id/interactions')
  async findInteractions(
    @Param('id') id: string,
    @Query() query: GetCustomerInteractionsQueryDto,
  ) {
    return this.customersService.findInteractions(id, query);
  }

  @Post(':id/interactions/log')
  async logInteraction(
    @Param('id') id: string,
    @Body() dto: LogInteractionDto,
    @CurrentUser() user: User,
  ) {
    return this.customersService.logInteraction(id, dto, user.id);
  }

  @Get(':id/leads')
  async findLeads(@Param('id') id: string) {
    return this.customersService.findLeads(id);
  }
}
