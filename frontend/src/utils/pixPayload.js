export function generatePixPayload({ key, name, city, amount, txid = '***' }) {
    if (!key) return '';
    let cleanKey = key.trim();

    // Sanitiza nome e cidade para o padrão ASCII sem acentos (máx 25 e 15 chars conforme BACEN)
    name = (name || 'Escolinha').substring(0, 25).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9 ]/g, "");
    city = (city || 'Cidade').substring(0, 15).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9 ]/g, "");
    
    // Tratamento de formato para chave
    if (/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(cleanKey)) {
        const digits = cleanKey.replace(/\D/g, '');
        if (digits.length === 10 || digits.length === 11) {
            cleanKey = `+55${digits}`;
        }
    } else if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cleanKey) || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cleanKey)) {
        // CPF ou CNPJ com pontuação -> remove pontuação
        cleanKey = cleanKey.replace(/\D/g, '');
    }

    let payloadFormat = '000201';
    let merchantAccountInformation = `0014br.gov.bcb.pix01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
    let merchantAccountInformationLength = merchantAccountInformation.length.toString().padStart(2, '0');
    let merchantAccountInformationStr = `26${merchantAccountInformationLength}${merchantAccountInformation}`;
    let merchantCategoryCode = '52040000';
    let transactionCurrency = '5303986';
    
    let transactionAmountStr = '';
    if (amount && parseFloat(amount) > 0) {
        let amountStr = parseFloat(amount).toFixed(2);
        transactionAmountStr = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
    }
    
    let countryCode = '5802BR';
    let merchantName = `59${name.length.toString().padStart(2, '0')}${name}`;
    let merchantCity = `60${city.length.toString().padStart(2, '0')}${city}`;
    
    let cleanTxid = (txid || '***').substring(0, 25).replace(/[^A-Za-z0-9*]/g, '');
    if (!cleanTxid) cleanTxid = '***';
    let additionalDataField = `05${cleanTxid.length.toString().padStart(2, '0')}${cleanTxid}`;
    let additionalDataFieldLength = additionalDataField.length.toString().padStart(2, '0');
    let additionalDataFieldStr = `62${additionalDataFieldLength}${additionalDataField}`;
    
    let payload = `${payloadFormat}${merchantAccountInformationStr}${merchantCategoryCode}${transactionCurrency}${transactionAmountStr}${countryCode}${merchantName}${merchantCity}${additionalDataFieldStr}6304`;
    
    return payload + crc16(payload);
}

function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}
