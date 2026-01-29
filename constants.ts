import { Gift } from './types';

export const EVENT_DATE = new Date('2026-02-15T15:00:00');
export const ADMIN_NAME = 'Emily Thalia';

// URL do Google Apps Script (Backend via Planilha)
export const SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyM4jEADX2uxzXqzefXg8dV22I_SwZXqU8JCyDeTFmkTxoa3h6AEnmYOIhtoPFhVcY_sQ/exec';

export const INITIAL_GIFTS: Gift[] = [
  {
    id: '1',
    name: "Jogo de Panelas Completo",
    category: 'Cozinha',
    priceEstimate: 289.90,
    imageUrl: "https://down-br.img.susercontent.com/file/br-11134207-81z1k-milpmcfqw16pe7.webp",
    shopeeUrl: "https://shopee.com.br/Jogo-de-Panelas-D'It%C3%A1lia-Teflon-10-Pe%C3%A7as-F%C3%A1cil-de-Limpar-e-N%C3%A3o-Gruda-Utens%C3%ADlios-e-Tampa-Vidro-i.328530918.13596339620?extraParams=%7B%22display_model_id%22%3A189170254733%2C%22model_selection_logic%22%3A3%7D&sp_atk=29606285-aea3-49de-8aaf-eace5063e3c6&xptdk=29606285-aea3-49de-8aaf-eace5063e3c6",
    status: 'available'
  }
];