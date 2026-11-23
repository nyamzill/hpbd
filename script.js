// Массив наборов фотографий: 3 набора по 3 фото
const photoSets = [
    ["img/photo1.jpg", "img/photo2.jpg", "img/photo3.jpg"],
    ["img/photo4.jpg", "img/photo5.jpg", "img/photo6.jpg"],
    ["img/photo7.jpg", "img/photo8.jpg", "img/photo9.jpg"]
];

// Текущий набор (начинаем с первого — индекса 0)
let currentSet = 0;

// Находим элементы на странице
const changeBtn = document.getElementById("changeBtn");

if (changeBtn) {
    const photo1 = document.getElementById("photo1");
    const photo2 = document.getElementById("photo2");
    const photo3 = document.getElementById("photo3");

    // ... дальше идёт showSet и обработчик клика ...
}

// Функция, которая ставит нужный набор фото
function showSet(index) {
    photo1.src = photoSets[index][0];
    photo2.src = photoSets[index][1];
    photo3.src = photoSets[index][2];
}

if (changeBtn) {
    changeBtn.addEventListener("click", function () {
        // 1. Делаем все фото прозрачными
        photo1.style.opacity = "0";
        photo2.style.opacity = "0";
        photo3.style.opacity = "0";

        // 2. Ждём полсекунды (пока они исчезнут), потом меняем картинки и проявляем обратно
        setTimeout(function () {
            currentSet = (currentSet + 1) % photoSets.length;
            showSet(currentSet); // меняем src

            // 3. Возвращаем прозрачность (фото проявятся)
            photo1.style.opacity = "1";
            photo2.style.opacity = "1";
            photo3.style.opacity = "1";
        }, 400); // 400мс — должно совпадать с transition в CSS (0.4s)
    });
}


// ===== КОНФЕТТИ =====

// Создаём canvas (холст) для конфетти и кладём его поверх страницы
const canvas = document.createElement("canvas");
canvas.id = "confettiCanvas";
document.body.appendChild(canvas);

// Настраиваем canvas на весь экран, поверх всего, но клики "пропускает" сквозь себя
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.pointerEvents = "none";   // чтобы не мешал нажимать кнопки
canvas.style.zIndex = "9999";

const ctx = canvas.getContext("2d");
let confettiParticles = [];
let animationId = null;

// Подгоняем размер canvas под окно (и при изменении размера)
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Палитра конфетти
const confettiColors = ["#c2185b", "#f0a500", "#4fc3f7", "#81c784", "#ba68c8", "#ff8a65"];

// Запуск конфетти: создаём частицы
function launchConfetti() {
    const count = 150;   // сколько конфетти
    for (let i = 0; i < count; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,          // случайная позиция по X
            y: -20 - Math.random() * canvas.height,   // стартуют выше экрана
            size: 6 + Math.random() * 8,              // размер
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            speedY: 2 + Math.random() * 3,            // скорость падения
            speedX: -1.5 + Math.random() * 3,         // лёгкий снос вбок
            rotation: Math.random() * 360,            // начальный поворот
            rotationSpeed: -6 + Math.random() * 12,   // скорость вращения
            shape: Math.random() < 0.5 ? "rect" : "circle" // форма
        });
    }
    // Если анимация ещё не идёт — запускаем
    if (!animationId) {
        animateConfetti();
    }
}

// Отрисовка и движение частиц (вызывается ~60 раз в секунду)
function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // очищаем холст

    // Обновляем и рисуем каждую частицу
    confettiParticles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });

    // Убираем частицы, улетевшие за низ экрана
    confettiParticles = confettiParticles.filter(p => p.y < canvas.height + 30);

    // Если частицы ещё есть — продолжаем анимацию, иначе останавливаем
    if (confettiParticles.length > 0) {
        animationId = requestAnimationFrame(animateConfetti);
    } else {
        animationId = null;
    }
}

// ===== КНОПКА КОНФЕТТИ =====
const confettiBtn = document.getElementById("confettiBtn");
if (confettiBtn) {
    confettiBtn.addEventListener("click", function () {
        launchConfetti();
    });
}
// ===== КОНВЕРТ =====
const envelope = document.getElementById("envelope");
const letter = document.getElementById("letter");

if (envelope && letter) {
    envelope.addEventListener("click", function () {
        envelope.classList.add("open");   // конверт исчезает
        letter.classList.add("open");     // письмо разворачивается

        // Плавно прячем заголовок (если он есть на странице)
        const pageTitle = document.querySelector(".page-title");
        if (pageTitle) {
            pageTitle.style.transition = "opacity 0.4s";
            pageTitle.style.opacity = "0";
        }
    });
}
// ===== КНИЖКА-АЛЬБОМ (исправленная) =====
const book = document.getElementById("book");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

if (book && prevBtn && nextBtn) {
    const papers = Array.from(document.querySelectorAll(".paper"));
    let currentPage = 0;

    // Функция для расстановки слоёв (чтобы не мигало)
    function updateZIndexes() {
        papers.forEach((paper, index) => {
            // Если страница уже перевёрнута — она уходит вниз
            // Если нет — она лежит в стопке, и чем больше индекс, тем ниже
            if (index < currentPage) {
                paper.style.zIndex = index; // перевёрнутые — внизу
            } else {
                paper.style.zIndex = papers.length - index; // неперевёрнутые — сверху
            }
        });
    }

    function updateButtons() {
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === papers.length;
    }

    // Вперед
    nextBtn.addEventListener("click", function() {
        if (currentPage < papers.length) {
            papers[currentPage].classList.add("turned");
            currentPage++;
            updateZIndexes();
            updateButtons();
        }
    });

    // Назад
    prevBtn.addEventListener("click", function() {
        if (currentPage > 0) {
            currentPage--;
            papers[currentPage].classList.remove("turned");
            updateZIndexes();
            updateButtons();
        }
    });

    // Клик по самой книге (открыть)
    book.addEventListener("click", function(e) {
        if (e.target.closest('.book-controls')) return; 
        if (currentPage < papers.length) {
            // Если открываем первую страницу — включаем анимацию увеличения
            if (currentPage === 0) {
                book.classList.add("is-open");
            }
            papers[currentPage].classList.add("turned");
            currentPage++;
            updateZIndexes();
            updateButtons();
        }
    });

    // Кнопка "Вперед"
    nextBtn.addEventListener("click", function() {
        if (currentPage < papers.length) {
            // Если открываем первую страницу — включаем анимацию
            if (currentPage === 0) {
                book.classList.add("is-open");
            }
            papers[currentPage].classList.add("turned");
            currentPage++;
            updateZIndexes();
            updateButtons();
        }
    });
    // Инициализация
    updateZIndexes();
    updateButtons();
}
// ===== ШЛЕЙФ ЗА КУРСОРОМ =====
document.addEventListener("mousemove", function (e) {
    // Не создаём искры слишком часто (каждое 2-е движение)
    if (Math.random() > 0.5) return; 

    // Создаём элемент
    const spark = document.createElement("div");
    spark.className = "cursor-spark";
    spark.textContent = Math.random() > 0.5 ? "✨" : "💖"; // смешиваем искры и сердечки

    // Ставим его в место курсора
    spark.style.left = e.clientX + "px";
    spark.style.top = e.clientY + "px";

    // Небольшое случайное смещение
    spark.style.transform = `translate(-50%, -50%) scale(${0.5 + Math.random()})`;

    // Добавляем на страницу
    document.body.appendChild(spark);

    // Удаляем через 0.8 сек (когда анимация закончится)
    setTimeout(() => {
        spark.remove();
    }, 800);
});
// ===== МУЗЫКА (НЕПРЕРЫВНАЯ) =====
document.addEventListener("DOMContentLoaded", function() {
    const musicBtn = document.getElementById("musicBtn");
    const bgMusic = document.getElementById("bgMusic");

    if (musicBtn && bgMusic) {
        bgMusic.volume = 0.3; // комфортная громкость

        // 1. Проверяем, играла ли музыка на прошлой странице
        const wasPlaying = localStorage.getItem("musicPlaying") === "true";
        const savedTime = parseFloat(localStorage.getItem("musicTime")) || 0;

        // Если играла — включаем и перематываем на сохранённое время
        if (wasPlaying) {
            bgMusic.currentTime = savedTime;
            bgMusic.play().then(() => {
                musicBtn.classList.add("playing");
                musicBtn.textContent = "⏸";
            }).catch(err => {
                // Браузер может заблокировать автозапуск, если не было клика
                console.log("Автозапуск заблокирован. Нужен клик.");
            });
        }

        // 2. Сохраняем время каждые полсекунды (чтобы не терять позицию)
        bgMusic.addEventListener("timeupdate", function() {
            if (!bgMusic.paused) {
                localStorage.setItem("musicTime", bgMusic.currentTime);
                localStorage.setItem("musicPlaying", "true");
            }
        });

        // 3. Обработчик клика (включить/выключить)
        musicBtn.addEventListener("click", function (e) {
            e.preventDefault();
            
            if (bgMusic.paused) {
                bgMusic.play();
                musicBtn.classList.add("playing");
                musicBtn.textContent = "⏸";
                localStorage.setItem("musicPlaying", "true");
            } else {
                bgMusic.pause();
                musicBtn.classList.remove("playing");
                musicBtn.textContent = "🎵";
                localStorage.setItem("musicPlaying", "false");
            }
        });
    }
});
// ===== КАССЕТЫ И ВИДЕО =====
const cassettes = document.querySelectorAll(".cassette");
const videoModal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");
const closeVideo = document.getElementById("closeVideo");

if (videoModal && modalVideo) {
    cassettes.forEach(cassette => {
        cassette.addEventListener("click", function() {
            const videoSrc = this.getAttribute("data-video");
            modalVideo.src = videoSrc;
            videoModal.classList.add("active");
            modalVideo.play();
        });
    });

    function closeModal() {
        videoModal.classList.remove("active");
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.src = "";
    }

    closeVideo.addEventListener("click", closeModal);
    videoModal.addEventListener("click", function(e) {
        if (e.target === videoModal) {
            closeModal();
        }
    });
}
// ===== ТОРТ СО СВЕЧОЙ =====
// ===== ТОРТ СО СВЕЧОЙ =====
const cake = document.getElementById("cake");
const cakeHint = document.getElementById("cakeHint");
const bigPhoto = document.getElementById("bigPhoto"); // Находим фото

if (cake) {
    cake.addEventListener("click", function () {
        cake.classList.add("blown-out");
        
        if (cakeHint) {
            cakeHint.textContent = "Ура! Желание загадано! 🎉";
            cakeHint.style.color = "#c2185b";
        }

        // Показываем фото с задержкой (плавно)
        if (bigPhoto) {
            bigPhoto.classList.remove("hidden-photo");
        }

        if (typeof launchConfetti === "function") {
            launchConfetti();
        }
    });
}
// ===== ПЕЧАТЬ И ВИДЕО (Надёжный вариант) =====
const letterStamp = document.getElementById("letterStamp");

if (letterStamp) {
    letterStamp.addEventListener("click", function(e) {
        e.stopPropagation();
        
        // Находим элементы прямо здесь, чтобы не было конфликтов
        const modal = document.getElementById("videoModal");
        const video = document.getElementById("modalVideo");
        
        if (modal && video) {
            video.src = "video-hpbd.mp4"; // Твоё видео
            modal.classList.add("active");
            video.play();
        }
    });
}
