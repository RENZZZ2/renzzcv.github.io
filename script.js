// script.js

// Fungsi untuk mengonversi TXT ke VCF
function convertTxtToVcf() {
    const fileInput = document.getElementById('txt-file');
    const contactName = document.getElementById('contact-name').value;
    const vcfFileName = document.getElementById('vcf-file-name').value;
    const fileInfo = document.getElementById('file-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file TXT terlebih dahulu.');
        return;
    }
    if (!contactName || !vcfFileName) {
        alert('Silakan masukkan nama kontak dan nama file VCF.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const lines = event.target.result.split('\n').filter(line => line.trim() !== '');
        let index = 0;

        while (index < lines.length) {
            let contactNumber = lines[index].trim();
            let vcfFileContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName} ${index + 1}\nTEL:+${contactNumber}\nEND:VCARD\n`;
            
            // Membuat file VCF untuk setiap kontak
            const vcfBlob = new Blob([vcfFileContent], { type: 'text/vcard' });
            const vcfUrl = URL.createObjectURL(vcfBlob);
            const link = document.createElement('a');
            link.href = vcfUrl;
            link.download = `${vcfFileName}_${index + 1}.vcf`;
            link.click();
            URL.revokeObjectURL(vcfUrl);

            index++;
        }

        fileInfo.textContent = 'Konversi selesai. File VCF telah diunduh.';
    };

    reader.readAsText(file);
}


// Fungsi untuk menggabungkan file TXT
function mergeTxtFiles() {
    const fileInput = document.getElementById('merge-files');
    const mergedFileName = document.getElementById('merged-file-name').value;
    const mergeFileInfo = document.getElementById('merge-file-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file TXT terlebih dahulu.');
        return;
    }
    if (!mergedFileName) {
        alert('Silakan masukkan nama file gabungan.');
        return;
    }

    const files = fileInput.files;
    let combinedText = '';

    const readFile = (file, callback) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            callback(event.target.result);
        };
        reader.onerror = function(error) {
            console.error('Terjadi kesalahan saat membaca file:', error);
            mergeFileInfo.textContent = 'Terjadi kesalahan saat penggabungan.';
        };
        reader.readAsText(file);
    };

    let filesProcessed = 0;
    for (const file of files) {
        readFile(file, (fileContent) => {
            combinedText += fileContent + '\n';
            filesProcessed++;
            if (filesProcessed === files.length) {
                const mergedBlob = new Blob([combinedText], { type: 'text/plain' });
                const url = URL.createObjectURL(mergedBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${mergedFileName}.txt`;
                link.click();
                URL.revokeObjectURL(url);
                mergeFileInfo.textContent = 'Gabungan selesai. File TXT telah diunduh.';
            }
        });
    }
}

// Fungsi untuk mengonversi VCF ke TXT
function convertVcfToTxt() {
    const fileInput = document.getElementById('vcf-files');
    const txtFileName = document.getElementById('txt-file-name').value;
    const vcfToTxtInfo = document.getElementById('vcf-to-txt-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file VCF terlebih dahulu.');
        return;
    }
    if (!txtFileName) {
        alert('Silakan masukkan nama file TXT.');
        return;
    }

    const files = fileInput.files;
    let allContacts = '';

    const readFile = (file, callback) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            callback(event.target.result);
        };
        reader.onerror = function(error) {
            console.error('Terjadi kesalahan saat membaca file:', error);
            vcfToTxtInfo.textContent = 'Terjadi kesalahan saat konversi.';
        };
        reader.readAsText(file);
    };

    let filesProcessed = 0;
    for (const file of files) {
        readFile(file, (fileContent) => {
            const contacts = fileContent.split('END:VCARD').map(vcard => {
                const telMatch = vcard.match(/TEL:\+(\d+)/);
                return telMatch ? telMatch[1] : '';
            }).filter(tel => tel !== '');

            allContacts += contacts.join('\n') + '\n';

            filesProcessed++;
            if (filesProcessed === files.length) {
                const txtBlob = new Blob([allContacts], { type: 'text/plain' });
                const url = URL.createObjectURL(txtBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${txtFileName}.txt`;
                link.click();
                URL.revokeObjectURL(url);
                vcfToTxtInfo.textContent = 'Konversi selesai. File TXT telah diunduh.';
            }
        });
    }
}

// Fungsi untuk mengonversi PDF ke Word
function convertPdfToWord() {
    const fileInput = document.getElementById('pdf-file');
    const wordFileName = document.getElementById('word-file-name').value;
    const pdfToWordInfo = document.getElementById('pdf-to-word-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file PDF terlebih dahulu.');
        return;
    }
    if (!wordFileName) {
        alert('Silakan masukkan nama file Word.');
        return;
    }

    const file = fileInput.files[0];
    // Untuk konversi PDF ke Word, Anda memerlukan layanan backend atau library eksternal
    // Contoh ini hanya untuk simulasi dan tidak akan benar-benar mengonversi file
    pdfToWordInfo.textContent = 'Fitur ini belum diimplementasikan. Silakan gunakan layanan konversi PDF ke Word eksternal.';
}

// Fungsi untuk mengonversi Word ke PDF
function convertWordToPdf() {
    const fileInput = document.getElementById('word-file');
    const pdfOutputName = document.getElementById('pdf-output-name').value;
    const wordToPdfInfo = document.getElementById('word-to-pdf-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file Word terlebih dahulu.');
        return;
    }
    if (!pdfOutputName) {
        alert('Silakan masukkan nama file PDF.');
        return;
    }

    const file = fileInput.files[0];
    // Untuk konversi Word ke PDF, Anda memerlukan layanan backend atau library eksternal
    // Contoh ini hanya untuk simulasi dan tidak akan benar-benar mengonversi file
    wordToPdfInfo.textContent = 'Fitur ini belum diimplementasikan. Silakan gunakan layanan konversi Word ke PDF eksternal.';
}

// Fungsi untuk membagi file VCF
function splitVcfFile() {
    const fileInput = document.getElementById('vcf-split-file');
    const splitCount = parseInt(document.getElementById('split-count').value, 10);
    const splitFileName = document.getElementById('split-file-name').value;
    const vcfSplitInfo = document.getElementById('vcf-split-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file VCF terlebih dahulu.');
        return;
    }
    if (!splitCount || !splitFileName) {
        alert('Silakan masukkan jumlah kontak per file dan nama file VCF.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const lines = event.target.result.split('\n');
        let index = 0;

        while (index < lines.length) {
            let vcfFileContent = `BEGIN:VCARD\nVERSION:3.0\n`;
            for (let i = 0; i < splitCount && index < lines.length; i++, index++) {
                vcfFileContent += `TEL:+${lines[index].trim()}\n`;
            }
            vcfFileContent += `END:VCARD\n`;

            const vcfBlob = new Blob([vcfFileContent], { type: 'text/vcard' });
            const vcfUrl = URL.createObjectURL(vcfBlob);
            const link = document.createElement('a');
            link.href = vcfUrl;
            link.download = `${splitFileName}_${Math.floor(index / splitCount)}.vcf`;
            link.click();
            URL.revokeObjectURL(vcfUrl);
        }

        vcfSplitInfo.textContent = 'Pecah selesai. File VCF telah diunduh.';
    };

    reader.readAsText(file);
}

// Fungsi untuk mengganti nama kontak di file VCF
function editVcfContactName() {
    const fileInput = document.getElementById('vcf-edit-file');
    const oldName = document.getElementById('old-contact-name').value;
    const newName = document.getElementById('new-contact-name').value;
    const editFileName = document.getElementById('edit-file-name').value;
    const vcfEditInfo = document.getElementById('vcf-edit-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file VCF terlebih dahulu.');
        return;
    }
    if (!oldName || !newName || !editFileName) {
        alert('Silakan masukkan nama kontak lama, nama kontak baru, dan nama file VCF.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const fileContent = event.target.result;
        const updatedContent = fileContent.replace(new RegExp(`FN:${oldName}`, 'g'), `FN:${newName}`);
        const vcfBlob = new Blob([updatedContent], { type: 'text/vcard' });
        const vcfUrl = URL.createObjectURL(vcfBlob);
        const link = document.createElement('a');
        link.href = vcfUrl;
        link.download = `${editFileName}.vcf`;
        link.click();
        URL.revokeObjectURL(vcfUrl);
        vcfEditInfo.textContent = 'Ganti nama selesai. File VCF telah diunduh.';
    };

    reader.readAsText(file);
}
