// DOM 요소
const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const qualitySlider = document.getElementById("quality");
const qualityValue = document.getElementById("quality-value");
const resizeModeRadios = document.querySelectorAll('input[name="resize-mode"]');
const targetWidthInput = document.getElementById("target-width");
const targetHeightInput = document.getElementById("target-height");
const convertBtn = document.getElementById("convert-btn");
const downloadAllBtn = document.getElementById("download-all-btn");
const clearBtn = document.getElementById("clear-btn");
const progressContainer = document.getElementById("progress-container");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const originalSection = document.getElementById("original-section");
const originalGrid = document.getElementById("original-grid");
const originalCount = document.getElementById("original-count");
const resultSection = document.getElementById("result-section");
const resultGrid = document.getElementById("result-grid");
const resultCount = document.getElementById("result-count");

// 상태
let uploadedFiles = [];
let convertedFiles = [];

// 초기화
function init() {
  setupEventListeners();
  updateResizeInputs();
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 업로드 영역 클릭
  uploadArea.addEventListener("click", () => fileInput.click());

  // 파일 선택
  fileInput.addEventListener("change", handleFileSelect);

  // 드래그 앤 드롭
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);

  // 퀄리티 슬라이더
  qualitySlider.addEventListener("input", () => {
    qualityValue.textContent = qualitySlider.value;
  });

  // 리사이즈 모드 변경
  resizeModeRadios.forEach((radio) => {
    radio.addEventListener("change", updateResizeInputs);
  });

  // 버튼
  convertBtn.addEventListener("click", convertImages);
  downloadAllBtn.addEventListener("click", downloadAll);
  clearBtn.addEventListener("click", clearAll);
}

// 드래그 오버
function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add("drag-over");
}

// 드래그 떠남
function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove("drag-over");
}

// 드롭
function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove("drag-over");

  const files = Array.from(e.dataTransfer.files).filter((file) =>
    file.type.startsWith("image/")
  );

  if (files.length > 0) {
    addFiles(files);
  }
}

// 파일 선택
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    addFiles(files);
  }
  // 같은 파일 다시 선택 가능하도록 초기화
  fileInput.value = "";
}

// 파일 추가
function addFiles(files) {
  uploadedFiles = [...uploadedFiles, ...files];
  renderOriginalImages();
  updateButtons();
}

// 원본 이미지 렌더링
function renderOriginalImages() {
  originalGrid.innerHTML = "";

  uploadedFiles.forEach((file, index) => {
    const card = createImageCard(file, index, false);
    originalGrid.appendChild(card);
  });

  originalCount.textContent = uploadedFiles.length;
  originalSection.hidden = uploadedFiles.length === 0;
}

// 이미지 카드 생성
function createImageCard(file, index, isConverted, blob = null) {
  const card = document.createElement("div");
  card.className = "image-card";

  const img = document.createElement("img");
  img.className = "thumbnail";

  if (isConverted && blob) {
    img.src = URL.createObjectURL(blob);
  } else {
    img.src = URL.createObjectURL(file);
  }

  const info = document.createElement("div");
  info.className = "card-info";

  const filename = document.createElement("div");
  filename.className = "filename";

  if (isConverted) {
    // 원본 파일명에서 확장자를 .webp로 변경
    const originalName = file.name;
    const nameWithoutExt =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    filename.textContent = nameWithoutExt + ".webp";
  } else {
    filename.textContent = file.name;
  }

  const filesize = document.createElement("div");
  filesize.className = "filesize";

  if (isConverted && blob) {
    const originalSize = formatFileSize(file.size);
    const newSize = formatFileSize(blob.size);
    const ratio = ((1 - blob.size / file.size) * 100).toFixed(1);
    filesize.textContent = `${originalSize} → ${newSize} (${
      ratio > 0 ? "-" : "+"
    }${Math.abs(ratio)}%)`;
  } else {
    filesize.textContent = formatFileSize(file.size);
  }

  info.appendChild(filename);
  info.appendChild(filesize);

  if (isConverted && blob) {
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "btn-download";
    downloadBtn.textContent = "⬇️ 다운로드";
    downloadBtn.addEventListener("click", () => {
      downloadSingle(blob, file.name);
    });
    info.appendChild(downloadBtn);
  }

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

// 파일 크기 포맷
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// 리사이즈 입력 필드 업데이트
function updateResizeInputs() {
  const mode = document.querySelector(
    'input[name="resize-mode"]:checked'
  ).value;

  switch (mode) {
    case "none":
      targetWidthInput.disabled = true;
      targetHeightInput.disabled = true;
      break;
    case "width":
      targetWidthInput.disabled = false;
      targetHeightInput.disabled = true;
      break;
    case "height":
      targetWidthInput.disabled = true;
      targetHeightInput.disabled = false;
      break;
    case "both":
      targetWidthInput.disabled = false;
      targetHeightInput.disabled = false;
      break;
  }
}

// 버튼 상태 업데이트
function updateButtons() {
  convertBtn.disabled = uploadedFiles.length === 0;
  clearBtn.disabled = uploadedFiles.length === 0 && convertedFiles.length === 0;
  downloadAllBtn.disabled = convertedFiles.length === 0;
}

// 이미지 변환
async function convertImages() {
  if (uploadedFiles.length === 0) return;

  const quality = parseFloat(qualitySlider.value);
  const mode = document.querySelector(
    'input[name="resize-mode"]:checked'
  ).value;
  const targetWidth = parseInt(targetWidthInput.value) || 800;
  const targetHeight = parseInt(targetHeightInput.value) || 600;

  convertedFiles = [];
  resultGrid.innerHTML = "";

  progressContainer.hidden = false;
  progressFill.style.width = "0%";
  convertBtn.disabled = true;

  for (let i = 0; i < uploadedFiles.length; i++) {
    const file = uploadedFiles[i];
    const progress = (((i + 1) / uploadedFiles.length) * 100).toFixed(0);

    progressText.textContent = `변환 중... ${i + 1}/${
      uploadedFiles.length
    } (${progress}%)`;
    progressFill.style.width = progress + "%";

    try {
      const blob = await convertToWebP(
        file,
        quality,
        mode,
        targetWidth,
        targetHeight
      );
      convertedFiles.push({ file, blob });

      const card = createImageCard(file, i, true, blob);
      resultGrid.appendChild(card);
    } catch (error) {
      console.error(`Failed to convert ${file.name}:`, error);
    }

    // UI 업데이트를 위한 짧은 딜레이
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  progressText.textContent = `변환 완료! ${convertedFiles.length}개 이미지`;
  resultCount.textContent = convertedFiles.length;
  resultSection.hidden = convertedFiles.length === 0;

  setTimeout(() => {
    progressContainer.hidden = true;
  }, 1500);

  updateButtons();
}

// WebP 변환
function convertToWebP(file, quality, mode, targetWidth, targetHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // 새 크기 계산
      const { width, height } = calculateDimensions(
        img.width,
        img.height,
        mode,
        targetWidth,
        targetHeight
      );

      // Canvas 생성
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // WebP로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/webp",
        quality
      );

      // 메모리 정리
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

// 크기 계산
function calculateDimensions(
  originalWidth,
  originalHeight,
  mode,
  targetWidth,
  targetHeight
) {
  switch (mode) {
    case "none":
      return { width: originalWidth, height: originalHeight };

    case "width":
      // 가로 고정, 세로 비율 유지
      const ratioW = targetWidth / originalWidth;
      return {
        width: targetWidth,
        height: Math.round(originalHeight * ratioW),
      };

    case "height":
      // 세로 고정, 가로 비율 유지
      const ratioH = targetHeight / originalHeight;
      return {
        width: Math.round(originalWidth * ratioH),
        height: targetHeight,
      };

    case "both":
      // 가로 세로 모두 지정
      return { width: targetWidth, height: targetHeight };

    default:
      return { width: originalWidth, height: originalHeight };
  }
}

// 개별 다운로드
function downloadSingle(blob, originalFilename) {
  const nameWithoutExt =
    originalFilename.substring(0, originalFilename.lastIndexOf(".")) ||
    originalFilename;
  const newFilename = nameWithoutExt + ".webp";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = newFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 전체 다운로드 (ZIP)
async function downloadAll() {
  if (convertedFiles.length === 0) return;

  downloadAllBtn.disabled = true;
  downloadAllBtn.textContent = "📦 ZIP 생성 중...";

  try {
    const zip = new JSZip();

    for (const { file, blob } of convertedFiles) {
      const nameWithoutExt =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const newFilename = nameWithoutExt + ".webp";
      zip.file(newFilename, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webp_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to create ZIP:", error);
    alert("ZIP 파일 생성에 실패했습니다.");
  }

  downloadAllBtn.disabled = false;
  downloadAllBtn.textContent = "📦 전체 다운로드 (ZIP)";
}

// 초기화
function clearAll() {
  // 메모리 정리
  uploadedFiles = [];
  convertedFiles = [];

  // UI 초기화
  originalGrid.innerHTML = "";
  resultGrid.innerHTML = "";
  originalSection.hidden = true;
  resultSection.hidden = true;
  originalCount.textContent = "0";
  resultCount.textContent = "0";

  updateButtons();
}

// 앱 시작
init();
