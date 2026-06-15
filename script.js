const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const emailContactLink = document.querySelector("#email-contact-link");
const faqItems = document.querySelectorAll(".faq-item");
const benefitItems = document.querySelectorAll(".benefits-grid .benefit.reveal");
const videoCards = document.querySelectorAll(".video-card");
const videoModal = document.querySelector("#video-modal");
const videoModalFrame = document.querySelector("#video-modal-frame");
const videoModalTitle = document.querySelector("#video-modal-title");
const videoCloseTriggers = document.querySelectorAll("[data-video-close]");
const videoModalDialog = document.querySelector(".video-modal-dialog");
const videoModalFallback = document.querySelector("#video-modal-fallback");
const videoModalYoutubeLink = document.querySelector("#video-modal-youtube-link");
const videoThumbs = document.querySelectorAll(".video-thumb img");

if (emailContactLink) {
  const emailUser = ["leandro", ".", "iccganchos"].join("");
  const emailDomain = ["gmail", ".", "com"].join("");
  const emailAddress = `${emailUser}@${emailDomain}`;
  const subject = encodeURIComponent("Solicitação de orçamento");

  emailContactLink.href = `mailto:${emailAddress}?subject=${subject}`;
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

benefitItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 0.1}s`;
});

videoThumbs.forEach((thumb) => {
  thumb.addEventListener("error", () => {
    const fallbackSrc = thumb.getAttribute("data-fallback-src");
    const currentSrc = thumb.getAttribute("src");
    const thumbContainer = thumb.closest(".video-thumb");

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      thumb.setAttribute("src", fallbackSrc);
      return;
    }

    if (thumbContainer) {
      thumbContainer.classList.add("is-fallback");
    }
  });
});

if (faqItems.length) {
  const setFaqState = (item, isOpen) => {
    const trigger = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-panel");
    const answer = item.querySelector(".faq-answer");

    item.classList.toggle("is-open", isOpen);

    if (trigger) {
      trigger.setAttribute("aria-expanded", String(isOpen));
    }

    if (panel) {
      panel.style.maxHeight = isOpen && answer ? `${answer.scrollHeight}px` : "0px";
    }
  };

  faqItems.forEach((item, index) => {
    setFaqState(item, index === 0);

    const trigger = item.querySelector(".faq-trigger");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      faqItems.forEach((faqItem) => setFaqState(faqItem, false));
      setFaqState(item, !isOpen);
    });
  });

  window.addEventListener("resize", () => {
    faqItems.forEach((item) => {
      if (item.classList.contains("is-open")) {
        setFaqState(item, true);
      }
    });
  });
}

if (videoModal && videoModalFrame && videoCards.length) {
  let videoFallbackTimeout;
  let currentVideoUrl = "";

  const extractYouTubeId = (value) => {
    if (!value) {
      return "";
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return value;
    }

    try {
      const url = new URL(value);

      if (url.hostname.includes("youtu.be")) {
        return url.pathname.replace("/", "").trim();
      }

      if (url.searchParams.get("v")) {
        return url.searchParams.get("v");
      }

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => part === "embed");

      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }
    } catch {}

    return "";
  };

  const buildEmbedUrl = (videoId) => {
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
    });

    if (window.location.protocol.startsWith("http")) {
      params.set("origin", window.location.origin);
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  const canAttemptEmbeddedPlayback = () =>
    window.location.protocol === "http:" || window.location.protocol === "https:";

  const showVideoFallback = () => {
    videoModalFrame.innerHTML = "";

    if (videoModalFallback) {
      videoModalFallback.hidden = false;
    }
  };

  const scheduleVideoFallback = () => {
    window.clearTimeout(videoFallbackTimeout);
    videoFallbackTimeout = window.setTimeout(() => {
      showVideoFallback();
    }, 2200);
  };

  const openVideoModal = (videoUrl, title) => {
    const videoId = extractYouTubeId(videoUrl);

    if (!videoId) {
      return;
    }

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

    if (videoModalFallback) {
      videoModalFallback.hidden = true;
    }

    if (videoModalYoutubeLink) {
      videoModalYoutubeLink.href = watchUrl;
    }

    currentVideoUrl = watchUrl;

    if (canAttemptEmbeddedPlayback()) {
      videoModalFrame.innerHTML = `
        <iframe
          src="${buildEmbedUrl(videoId)}"
          title="${title}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      `;

      const iframe = videoModalFrame.querySelector("iframe");

      if (iframe) {
        iframe.addEventListener(
          "load",
          () => {
            window.clearTimeout(videoFallbackTimeout);
          },
          { once: true }
        );
      }

      scheduleVideoFallback();
    } else {
      showVideoFallback();
    }

    if (videoModalTitle) {
      videoModalTitle.textContent = title;
    }

    videoModal.classList.add("is-open");
    videoModal.setAttribute("aria-hidden", "false");
    body.classList.add("video-modal-open");
    scheduleVideoFallback();

    if (videoModalDialog) {
      videoModalDialog.focus();
    }
  };

  const closeVideoModal = () => {
    window.clearTimeout(videoFallbackTimeout);
    videoModal.classList.remove("is-open");
    videoModal.setAttribute("aria-hidden", "true");
    videoModalFrame.innerHTML = "";
    if (videoModalFallback) {
      videoModalFallback.hidden = true;
    }
    currentVideoUrl = "";
    body.classList.remove("video-modal-open");
  };

  videoCards.forEach((card) => {
    card.addEventListener("click", () => {
      const videoUrl = card.getAttribute("data-video-url") || "";
      const title = card.getAttribute("data-video-title") || "Vídeo";

      if (videoUrl) {
        openVideoModal(videoUrl, title);
      }
    });
  });

  videoCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closeVideoModal);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && videoModal.classList.contains("is-open")) {
      closeVideoModal();
    }
  });
}
