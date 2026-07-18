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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

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
}
