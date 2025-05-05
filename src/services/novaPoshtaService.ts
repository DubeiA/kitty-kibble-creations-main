// import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors: string[];
}

interface NovaPoshtaConfig {
  apiKey: string;
  baseUrl: string;
}

interface Warehouse {
  Description: string;
  Ref: string;
}

interface City {
  Description: string;
  Ref: string;
  AreaDescription: string;
}

interface ShippingCost {
  Cost: number;
  EstimatedDeliveryDate: string;
}

interface TrackingInfo {
  Status: string;
  WarehouseSender: string;
  WarehouseRecipient: string;
  ScheduledDeliveryDate: string;
}

export class NovaPoshtaServices {
  private static apiKey: string = import.meta.env.VITE_NOVA_POSHTA_API_KEY;

  private static async makeRequest<T>(
    modelName: string,
    calledMethod: string,
    methodProperties: any
  ): Promise<ApiResponse<T>> {
    const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        modelName,
        calledMethod,
        methodProperties,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  }

  static async getCities(areaRef?: string): Promise<ApiResponse<City[]>> {
    if (areaRef) {
      // Отримуємо міста тільки для вибраної області
      return this.makeRequest<City[]>('Address', 'getCities', {
        AreaRef: areaRef,
        Limit: 1000,
      });
    }

    // Отримуємо всі області
    return this.makeRequest<City[]>('Address', 'getAreas', {});
  }

  static async getWarehouses(
    cityRef: string
  ): Promise<ApiResponse<Warehouse[]>> {
    return this.makeRequest<Warehouse[]>('Address', 'getWarehouses', {
      CityRef: cityRef,
    });
  }

  static async calculateShippingCost(
    citySender: string,
    cityRecipient: string,
    weight: number,
    cost: number
  ): Promise<ShippingCost> {
    console.log('Calculating shipping cost:', {
      citySender,
      cityRecipient,
      weight,
      cost,
    });

    const response = await this.makeRequest(
      'InternetDocument',
      'getDocumentPrice',
      {
        CitySender: citySender,
        CityRecipient: cityRecipient,
        Weight: weight,
        Cost: cost,
        ServiceType: 'WarehouseWarehouse',
      }
    );

    return response.data[0];
  }

  static async getCounterparties(
    counterpartyType: 'Sender' | 'Recipient'
  ): Promise<ApiResponse<any[]>> {
    return this.makeRequest('Counterparty', 'getCounterparties', {
      CounterpartyProperty: counterpartyType,
      Page: '1',
    });
  }

  static async getCounterpartyContactPersons(
    counterpartyRef: string
  ): Promise<ApiResponse<any[]>> {
    return this.makeRequest('Counterparty', 'getCounterpartyContactPersons', {
      Ref: counterpartyRef,
    });
  }

  static async saveCounterparty(data: {
    CounterpartyType: 'PrivatePerson' | 'Organization';
    CounterpartyProperty: 'Sender' | 'Recipient';
    CityRef: string;
    FirstName: string;
    LastName: string;
    Phone: string;
    MiddleName?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('Counterparty', 'save', data);
  }

  static async getSenderWarehouses(
    cityRef: string
  ): Promise<ApiResponse<any[]>> {
    return this.makeRequest('Address', 'getWarehouses', {
      CityRef: cityRef,
      TypeOfWarehouseRef: '841339c7-591a-42e2-8233-7a0a00f0ed6f', // Ref типу відділення (відділення)
    });
  }

  static async createWaybill(
    senderData: {
      CitySender: string;
      SenderAddress: string;
      Sender: string;
      ContactSender: string;
      SendersPhone: string;
    },
    recipientData: {
      CityRecipient: string;
      RecipientAddress: string;
      ContactRecipient: string;
      RecipientsPhone: string;
      Recipient: string;
    },
    cargoData: {
      Weight: number;
      ServiceType: 'WarehouseWarehouse' | 'WarehouseDoors';
      SeatsAmount: number;
      Description: string;
    },
    payerType: 'Sender' | 'Recipient',
    paymentMethod: 'Cash' | 'NonCash'
  ): Promise<string> {
    console.log('Creating waybill:', {
      senderData,
      recipientData,
      cargoData,
      payerType,
      paymentMethod,
    });

    const response = await this.makeRequest('InternetDocument', 'save', {
      Sender: senderData.Sender,
      CitySender: senderData.CitySender,
      SenderAddress: senderData.SenderAddress,
      ContactSender: senderData.ContactSender,
      SendersPhone: senderData.SendersPhone,
      Recipient: recipientData.Recipient,
      CityRecipient: recipientData.CityRecipient,
      RecipientAddress: recipientData.RecipientAddress,
      ContactRecipient: recipientData.ContactRecipient,
      RecipientsPhone: recipientData.RecipientsPhone,
      CargoType: 'Cargo',
      Weight: cargoData.Weight,
      ServiceType: cargoData.ServiceType,
      SeatsAmount: cargoData.SeatsAmount,
      Description: cargoData.Description,
      PayerType: payerType,
      PaymentMethod: paymentMethod,
      DateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });

    console.log('Nova Poshta response:', response);

    if (!response.success || !response.data || !response.data[0]) {
      throw new Error(
        'Nova Poshta error: ' + (response.errors?.join(', ') || 'Unknown error')
      );
    }
    return response.data[0].Ref;
  }

  static async trackWaybill(waybillNumber: string): Promise<TrackingInfo> {
    console.log('Tracking waybill:', waybillNumber);
    const response = await this.makeRequest(
      'TrackingDocument',
      'getStatusDocuments',
      {
        Documents: [
          {
            DocumentNumber: waybillNumber,
          },
        ],
      }
    );

    return response.data[0];
  }
}
