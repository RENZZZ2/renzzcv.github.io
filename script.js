// Fungsi untuk mengonversi TXT ke VCF
function convertTxtToVcf() {
    const fileInput = document.getElementById('txt-file');
    const contactName = document.getElementById('contact-name').value;
    const vcfFileName = document.getElementById('vcf-file-name').value;
    const contactCount = parseInt(document.getElementById('contact-count').value, 10); // Menambahkan pembatas jumlah kontak per file
    const fileInfo = document.getElementById('file-info');

    if (fileInput.files.length === 0) {
        alert('Silakan pilih file TXT terlebih dahulu.');
        return;
    }
    if (!contactName || !vcfFileName || isNaN(contactCount) || contactCount <= 0) {
        alert('Silakan masukkan nama kontak, nama file VCF, dan jumlah kontak per file yang valid.');
        return;
    }

    const files = fileInput.files;
    let totalFilesProcessed = 0;

    for (const file of files) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const lines = event.target.result.split('\n').filter(line => line.trim() !== '');
            let vcfFileContent = '';
            let fileCount = 0;
            let contactCounter = 0;

            lines.forEach((line, index) => {
                // Menghapus karakter non-numeric dan memastikan nomor diawali dengan +
                const contactNumber = line.trim().replace(/[^0-9]/g, '');
                const formattedNumber = contactNumber.startsWith('+') ? contactNumber : `+${contactNumber}`;
                contactCounter++;
                vcfFileContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName} ${contactCounter}\nTEL:${formattedNumber}\nEND:VCARD\n`;

                // Jika sudah mencapai batas jumlah kontak per file, simpan file VCF dan reset konten
                if (contactCounter % contactCount === 0 || index === lines.length - 1) {
                    const vcfBlob = new Blob([vcfFileContent], { type: 'text/vcard' });
                    const vcfUrl = URL.createObjectURL(vcfBlob);
                    const link = document.createElement('a');
                    link.href = vcfUrl;
                    link.download = `${vcfFileName}_${fileCount + 1}.vcf`; // Beri nomor pada setiap file VCF
                    link.click();
                    URL.revokeObjectURL(vcfUrl);

                    // Reset konten VCF dan increment file count
                    vcfFileContent = '';
                    fileCount++;
                }
            });

            totalFilesProcessed++;
            if (totalFilesProcessed === files.length) {
                fileInfo.textContent = 'Konversi selesai. Semua file VCF telah diunduh.';
            }
        };

        reader.onerror = function(error) {
            console.error('Terjadi kesalahan saat membaca file:', error);
            fileInfo.textContent = 'Terjadi kesalahan saat konversi.';
        };

        reader.readAsText(file);
    }
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

    const files = Array.from(fileInput.files); // Mengubah FileList menjadi array
    let combinedText = '';

    // Fungsi untuk membaca file satu per satu sesuai urutan
    const readFileSequentially = (index) => {
        if (index >= files.length) {
            // Jika semua file sudah dibaca, simpan file gabungan
            const mergedBlob = new Blob([combinedText], { type: 'text/plain' });
            const url = URL.createObjectURL(mergedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${mergedFileName}.txt`;
            link.click();
            URL.revokeObjectURL(url);
            mergeFileInfo.textContent = 'Gabungan selesai. File TXT telah diunduh.';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            combinedText += event.target.result + '\n'; // Menambahkan isi file ke teks gabungan
            readFileSequentially(index + 1); // Baca file berikutnya
        };
        reader.onerror = function(error) {
            console.error('Terjadi kesalahan saat membaca file:', error);
            mergeFileInfo.textContent = 'Terjadi kesalahan saat penggabungan.';
        };
        reader.readAsText(files[index]);
    };

    readFileSequentially(0); // Mulai membaca dari file pertama
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
