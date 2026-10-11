export function generatePixPayload({ key, name, city, amount, txid = '***' }) {
    name = (name || 'Escolinha').substring(0, 25).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    city = (city || 'Cidade').substring(0, 15).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let payloadFormat = '000201';
    let merchantAccountInformation = `0014BR.GOV.BCB.PIX01${key.length.toString().padStart(2, '0')}${key}`;
    let merchantAccountInformationLength = merchantAccountInformation.length.toString().padStart(2, '0');
    let merchantAccountInformationStr = `26${merchantAccountInformationLength}${merchantAccountInformation}`;
    let merchantCategoryCode = '52040000';
    let transactionCurrency = '5303986';
    
    let transactionAmountStr = '';
    if (amount) {
        let amountStr = parseFloat(amount).toFixed(2);
        transactionAmountStr = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
    }
    
    let countryCode = '5802BR';
    let merchantName = `59${name.length.toString().padStart(2, '0')}${name}`;
    let merchantCity = `60${city.length.toString().padStart(2, '0')}${city}`;
    
    let additionalDataField = `05${txid.length.toString().padStart(2, '0')}${txid}`;
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
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = (crc << 1);
            }
        }
    }
    crc &= 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
}
