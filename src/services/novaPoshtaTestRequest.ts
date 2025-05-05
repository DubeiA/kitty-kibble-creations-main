import { NovaPoshtaServices } from './novaPoshtaService';

// Захардкоджені дані відправника (магазину)
const senderData = {
  FirstName: 'Kitty',
  LastName: 'Shop',
  Phone: '380991112233',
  City: '8d5a980d-391c-11dd-90d9-001a92567626', // Ref Києва
  Warehouse: 'db5c88d7-391c-11dd-90d9-001a92567626', // Ref відділення Київ
};

// Тестові дані одержувача (можна замінити на реальні з форми)
const recipientData = {
  FirstName: 'Тест',
  LastName: 'Клієнт',
  Phone: '380991112244',
  City: 'db5c88d7-391c-11dd-90d9-001a92567626', // Ref міста
  Warehouse: 'db5c88d7-391c-11dd-90d9-001a92567626', // Ref відділення
};

const cargoData = {
  Description: 'Корм для котів (тест)',
  Weight: 1, // кг
  Cost: 500, // грн
};

export async function testCreateWaybill() {
  try {
    const waybillNumber = await NovaPoshtaServices.createWaybill(
      senderData,
      recipientData,
      cargoData
    );
    console.log('Waybill created:', waybillNumber);
    return waybillNumber;
  } catch (error) {
    console.error('Nova Poshta error:', error);
    return null;
  }
}

// Для ручного тесту (наприклад, викликати з консолі або з іншого місця)
// testCreateWaybill();
