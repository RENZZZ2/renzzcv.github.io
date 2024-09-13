function convertTxtToVcf() {
    const fileInput = document.getElementById('txt-file');
    const contactName = document.getElementById('contact-name').value;
    const vcfFileName = document.getElementById('vcf-file-name').value;
    const contactCount = parseInt(document.getElementById('contact-count').value, 10);
    const startNumber = parseInt(document.getElementById('start-number').value, 10); // Ambil nomor awal
    const fileInfo = document.getElementById('file-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file TXT terlebih dahulu.');
        return;
    }
    if (!contactName || !vcfFileName || isNaN(contactCount) || contactCount <= 0 || isNaN(startNumber)) {
        alert('Silakan masukkan nama kontak, nama file VCF, jumlah kontak per file, dan nomor awal yang valid.');
        return;
    }

    const files = fileInput.files;
    let allContacts = [];
    let filesRead = 0;

    const readFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function(event) {
                const lines = event.target.result.split('\n').filter(line => line.trim() !== '');
                lines.forEach(line => {
                    const contactNumber = line.trim().replace(/[^0-9]/g, '');
                    const formattedNumber = contactNumber.startsWith('+') ? contactNumber : `+${contactNumber}`;
                    allContacts.push(formattedNumber);
                });
                filesRead++;
                resolve();
            };

            reader.onerror = function(error) {
                reject('Terjadi kesalahan saat membaca file:', error);
            };

            reader.readAsText(file);
        });
    };

    const processFiles = async () => {
        try {
            for (const file of files) {
                await readFile(file);
            }

            if (allContacts.length === 0) {
                fileInfo.textContent = 'Tidak ada kontak ditemukan dalam file.';
                return;
            }

            const totalFiles = Math.ceil(allContacts.length / contactCount);
            fileInfo.textContent = `Total file VCF yang akan diunduh: ${totalFiles}`;

            let fileIndex = startNumber; // Mulai dengan nomor awal
            for (let i = 0; i < totalFiles; i++) {
                const startIndex = i * contactCount;
                const endIndex = Math.min(startIndex + contactCount, allContacts.length);
                const contactsChunk = allContacts.slice(startIndex, endIndex);
                let vcfFileContent = '';

                contactsChunk.forEach((contact, index) => {
                    vcfFileContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName} ${startIndex + index + 1}\nTEL:${contact}\nEND:VCARD\n`;
                });

                // Gunakan setTimeout untuk memastikan unduhan file tidak tumpang tindih
                await new Promise(resolve => setTimeout(resolve, 100)); // Delay 100ms untuk setiap file

                const vcfBlob = new Blob([vcfFileContent], { type: 'text/vcard' });
                const vcfUrl = URL.createObjectURL(vcfBlob);
                const link = document.createElement('a');
                link.href = vcfUrl;
                link.download = `${vcfFileName}_${fileIndex++}.vcf`; // Gunakan nomor awal dan increment
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(vcfUrl);

                console.log(`Downloaded file: ${vcfFileName}_${fileIndex - 1}.vcf`);
            }

            fileInfo.textContent = 'Konversi selesai. Semua file VCF telah diunduh.';
        } catch (error) {
            console.error(error);
            fileInfo.textContent = 'Terjadi kesalahan saat konversi.';
        }
    };

    processFiles();
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

    let mergedContent = '';
    const files = Array.from(fileInput.files);
    let totalFilesProcessed = 0;

    // Fungsi untuk membaca file dan menambahkannya ke mergedContent
    function readFile(file, index) {
        const reader = new FileReader();

        reader.onload = function(event) {
            mergedContent += event.target.result + '\n';

            totalFilesProcessed++;
            // Jika semua file sudah diproses, buat dan unduh file gabungan
            if (totalFilesProcessed === files.length) {
                const mergedBlob = new Blob([mergedContent], { type: 'text/plain' });
                const mergedUrl = URL.createObjectURL(mergedBlob);
                const link = document.createElement('a');
                link.href = mergedUrl;
                link.download = `${mergedFileName}.txt`;
                link.click();
                URL.revokeObjectURL(mergedUrl);
                mergeFileInfo.textContent = 'Penggabungan selesai.';
            }
        };

        reader.readAsText(file);
    }

    // Membaca file dalam urutan yang benar
    files.forEach((file, index) => {
        readFile(file, index);
    });
}




// Fungsi untuk mengonversi VCF ke TXT
function convertVcfToTxt() {
    const fileInput = document.getElementById('vcf-files');
    const txtFileName = document.getElementById('txt-file-name').value;
    const combineFiles = document.getElementById('combine-files').checked; // Menambahkan opsi gabung atau tidak
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
    let filesProcessed = 0;

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

    const processFile = (fileContent) => {
        // Pisahkan setiap vCard berdasarkan pola BEGIN:VCARD dan END:VCARD
        const vcardArray = fileContent.split(/END:VCARD\s*/).filter(vcard => vcard.trim() !== '');

        // Ekstrak nomor telepon dari setiap vCard
        const contacts = vcardArray.map(vcard => {
            const telMatch = vcard.match(/TEL:\+(\d+)/);
            return telMatch ? telMatch[1] : '';
        }).filter(tel => tel !== '');

        if (combineFiles) {
            allContacts += contacts.join('\n') + '\n';
        } else {
            // Simpan setiap file sebagai TXT terpisah jika tidak digabung
            const txtBlob = new Blob([contacts.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(txtBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${txtFileName}_${filesProcessed + 1}.txt`;
            link.click();
            URL.revokeObjectURL(url);
        }

        filesProcessed++;
        if (filesProcessed === files.length) {
            if (combineFiles) {
                const txtBlob = new Blob([allContacts], { type: 'text/plain' });
                const url = URL.createObjectURL(txtBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${txtFileName}.txt`;
                link.click();
                URL.revokeObjectURL(url);
                vcfToTxtInfo.textContent = 'Konversi selesai. File TXT gabungan telah diunduh.';
            } else {
                vcfToTxtInfo.textContent = 'Konversi selesai. Semua file TXT telah diunduh.';
            }
        }
    };

    for (const file of files) {
        readFile(file, processFile);
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
    const fileInput = document.getElementById('vcf-file');
    const splitFileName = document.getElementById('split-file-name').value;
    const contactsPerFile = parseInt(document.getElementById('contacts-per-file').value, 10);
    const vcfSplitInfo = document.getElementById('vcf-split-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file VCF terlebih dahulu.');
        return;
    }
    if (!splitFileName || isNaN(contactsPerFile) || contactsPerFile <= 0) {
        alert('Silakan masukkan nama file dan jumlah kontak per file yang valid.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const vcfData = event.target.result;
        const vcardArray = vcfData.split(/(?=BEGIN:VCARD)/).filter(vcard => vcard.trim() !== '');

        let fileCount = 0;
        while (vcardArray.length > 0) {
            // Ambil kontak sebanyak `contactsPerFile` dari array vCard
            const splitData = vcardArray.splice(0, contactsPerFile).join('\n');
            // Tambahkan baris baru di akhir jika diperlukan
            const vcfBlob = new Blob([splitData], { type: 'text/vcard' });
            const vcfUrl = URL.createObjectURL(vcfBlob);
            const link = document.createElement('a');
            link.href = vcfUrl;
            link.download = `${splitFileName}_${++fileCount}.vcf`;
            link.click();
            URL.revokeObjectURL(vcfUrl);
        }

        vcfSplitInfo.textContent = 'Pembagian file selesai. Semua file VCF telah diunduh.';
    };

    reader.onerror = function(error) {
        console.error('Terjadi kesalahan saat membaca file:', error);
        vcfSplitInfo.textContent = 'Terjadi kesalahan saat pembagian.';
    };

    reader.readAsText(file);
}
 
//PDF TO WORD 
async function convertPdfToWord() {
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
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('URL_TO_CONVERT_PDF_TO_WORD_API', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY'  // Jika API memerlukan otentikasi
            }
        });

        if (!response.ok) {
            throw new Error('Terjadi kesalahan saat mengonversi file.');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${wordFileName}.docx`;
        link.click();
        URL.revokeObjectURL(url);

        pdfToWordInfo.textContent = 'Konversi selesai. File Word telah diunduh.';
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        pdfToWordInfo.textContent = 'Terjadi kesalahan saat konversi.';
    }
}

//WORD TO PDF
async function convertWordToPdf() {
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
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('URL_TO_CONVERT_WORD_TO_PDF_API', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY' // Jika API memerlukan otentikasi
            }
        });

        if (!response.ok) {
            throw new Error('Terjadi kesalahan saat mengonversi file. Status: ' + response.status);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pdfOutputName}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        wordToPdfInfo.textContent = 'Konversi selesai. File PDF telah diunduh.';
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        wordToPdfInfo.textContent = 'Terjadi kesalahan saat konversi.';
    }
}

// GANTI NAMA KONTAK

// Fungsi untuk mengganti nama kontak di VCF
function editVcfContactName() {
    const fileInput = document.getElementById('vcf-edit-file');
    const newContactName = document.getElementById('new-contact-name').value;
    const editFileName = document.getElementById('edit-file-name').value;
    const vcfEditInfo = document.getElementById('vcf-edit-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file VCF terlebih dahulu.');
        return;
    }
    if (!newContactName || !editFileName) {
        alert('Silakan masukkan nama kontak baru dan nama file VCF.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        let vcfContent = event.target.result;
        // Mengganti semua nama kontak dengan nama baru
        const regex = /FN:[^\n]*/g; // Mengganti pola 'FN:...' apapun yang ada di dalamnya
        vcfContent = vcfContent.replace(regex, `FN:${newContactName}`);

        const editedBlob = new Blob([vcfContent], { type: 'text/vcard' });
        const editedUrl = URL.createObjectURL(editedBlob);
        const link = document.createElement('a');
        link.href = editedUrl;
        link.download = `${editFileName}.vcf`;
        link.click();
        URL.revokeObjectURL(editedUrl);
        vcfEditInfo.textContent = 'Penggantian nama selesai.';
    };

    reader.readAsText(file);
}
