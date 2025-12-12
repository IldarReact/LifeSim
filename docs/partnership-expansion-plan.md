# 🎯 План расширения согласований партнёрских бизнесов

## ✅ Уже реализовано:

1. **Изменение цены** (`price`) ✅
2. **Изменение количества** (`quantity`) ✅

## 📋 TODO - Новые типы согласований:

### 1. Найм сотрудника (`hire_employee`)
**Файлы**:
- `business-management-dialog.tsx` - обработчик `onHireEmployee`
- `partnership-business-slice.ts` - применение изменений

**Данные**:
```typescript
{
  employeeName: string
  employeeRole: EmployeeRole
  employeeSalary: number
  employeeStars: number
}
```

**Логика**:
- Если share > 50% → нанять сразу
- Если share = 50% → создать предложение
- Если share < 50% → ошибка

### 2. Увольнение сотрудника (`fire_employee`)
**Файлы**:
- `business-management-dialog.tsx` - обработчик `onFireEmployee`
- `partnership-business-slice.ts` - применение изменений

**Данные**:
```typescript
{
  fireEmployeeId: string
  fireEmployeeName: string
}
```

### 3. Заморозка бизнеса (`freeze`)
**Файлы**:
- `business-management-dialog.tsx` - кнопка заморозки
- `partnership-business-slice.ts` - изменение state

**Данные**:
```typescript
{} // Нет дополнительных данных
```

**Применение**:
```typescript
business.state = 'frozen'
```

### 4. Разморозка бизнеса (`unfreeze`)
**Файлы**:
- `business-management-dialog.tsx` - кнопка разморозки
- `partnership-business-slice.ts` - изменение state

**Данные**:
```typescript
{} // Нет дополнительных данных
```

**Применение**:
```typescript
business.state = 'active'
```

### 5. Открытие филиала (`open_branch`)
**Файлы**:
- `business-management-dialog.tsx` - обработчик `onOpenBranch`
- `partnership-business-slice.ts` - создание филиала

**Данные**:
```typescript
{
  branchName: string
  branchCost: number
}
```

### 6. Изменение автозакупки (`auto_purchase`)
**Файлы**:
- `business-management-dialog.tsx` - слайдер автозакупки
- `partnership-business-slice.ts` - изменение значения

**Данные**:
```typescript
{
  autoPurchaseAmount: number
}
```

## 🔧 Изменения в коде:

### 1. `business-management-dialog.tsx`

Обернуть все обработчики проверкой прав:

```typescript
const handleHireEmployee = (candidate: EmployeeCandidate) => {
  if (business.partners.length > 0 && player) {
    const canDirect = canMakeDirectChanges(business, player.id)
    const needsApproval = requiresApproval(business, player.id)

    if (needsApproval) {
      // Создать предложение
      proposeBusinessChange(business.id, 'hire_employee', {
        employeeName: candidate.name,
        employeeRole: candidate.role,
        employeeSalary: candidate.salary,
        employeeStars: candidate.stars,
      })
      return
    }

    if (!canDirect) {
      pushNotification({
        type: 'error',
        title: 'Недостаточно прав',
        message: 'Требуется согласие партнёра',
      })
      return
    }
  }

  // Прямой найм
  onHireEmployee(business.id, candidate)
}
```

### 2. `partnership-business-slice.ts`

Расширить `approveBusinessChange`:

```typescript
approveBusinessChange: (proposalId) => {
  const proposal = state.businessProposals.find((p) => p.id === proposalId)
  
  switch (proposal.changeType) {
    case 'price':
      // Применить изменение цены
      break
    case 'quantity':
      // Применить изменение количества
      break
    case 'hire_employee':
      // Нанять сотрудника
      state.hireEmployee(proposal.businessId, {
        name: proposal.data.employeeName,
        role: proposal.data.employeeRole,
        salary: proposal.data.employeeSalary,
        stars: proposal.data.employeeStars,
      })
      break
    case 'fire_employee':
      // Уволить сотрудника
      state.fireEmployee(proposal.businessId, proposal.data.fireEmployeeId)
      break
    case 'freeze':
      // Заморозить бизнес
      business.state = 'frozen'
      break
    case 'unfreeze':
      // Разморозить бизнес
      business.state = 'active'
      break
    case 'open_branch':
      // Открыть филиал
      state.openBranch(proposal.businessId)
      break
    case 'auto_purchase':
      // Изменить автозакупку
      business.inventory.autoPurchaseAmount = proposal.data.autoPurchaseAmount
      break
  }
}
```

### 3. `BusinessProposals.tsx`

Добавить отображение для всех типов:

```typescript
const getProposalDescription = (proposal: BusinessChangeProposal) => {
  switch (proposal.changeType) {
    case 'price':
      return `Изменить цену на ${proposal.data.newPrice}`
    case 'quantity':
      return `Изменить количество на ${proposal.data.newQuantity}`
    case 'hire_employee':
      return `Нанять ${proposal.data.employeeName} (${proposal.data.employeeRole})`
    case 'fire_employee':
      return `Уволить ${proposal.data.fireEmployeeName}`
    case 'freeze':
      return `Заморозить бизнес`
    case 'unfreeze':
      return `Разморозить бизнес`
    case 'open_branch':
      return `Открыть филиал "${proposal.data.branchName}"`
    case 'auto_purchase':
      return `Изменить автозакупку на ${proposal.data.autoPurchaseAmount}`
  }
}
```

## 🧪 Тесты:

Создан файл: `partnership-business-comprehensive.test.ts`

**Покрытие**:
- ✅ Изменение цены
- ✅ Изменение количества
- ✅ Найм сотрудника
- ✅ Увольнение сотрудника
- ✅ Заморозка/разморозка
- ✅ Открытие филиала
- ✅ Проверка прав
- ✅ Одобрение/отклонение

## 📝 Порядок реализации:

1. ✅ Расширить типы (`BusinessChangeType`)
2. ✅ Расширить данные предложений (`BusinessChangeProposal`)
3. ✅ Создать тесты
4. ⏳ Обновить `approveBusinessChange` для всех типов
5. ⏳ Обернуть все обработчики в `business-management-dialog.tsx`
6. ⏳ Обновить UI в `BusinessProposals.tsx`
7. ⏳ Запустить тесты

## 🎯 Следующий шаг:

Обновить `approveBusinessChange` для обработки всех типов изменений.
