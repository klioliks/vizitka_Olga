/**
 * TextType — vanilla JS порт компонента React Bits.
 * Эффект печати текста с мигающим курсором (GSAP).
 */
class TextType {
  constructor(element, options = {}) {
    this.root = element;
    this.text = Array.isArray(options.text) ? options.text : [options.text];
    this.typingSpeed = options.typingSpeed ?? 50;
    this.initialDelay = options.initialDelay ?? 0;
    this.pauseDuration = options.pauseDuration ?? 2000;
    this.deletingSpeed = options.deletingSpeed ?? 30;
    this.loop = options.loop ?? true;
    this.showCursor = options.showCursor ?? true;
    this.hideCursorWhileTyping = options.hideCursorWhileTyping ?? false;
    this.cursorCharacter = options.cursorCharacter ?? "|";
    this.cursorBlinkDuration = options.cursorBlinkDuration ?? 0.5;
    this.cursorClassName = options.cursorClassName ?? "";
    this.textColors = options.textColors ?? [];
    this.variableSpeed = options.variableSpeed;
    this.startOnVisible = options.startOnVisible ?? false;
    this.reverseMode = options.reverseMode ?? false;
    this.onSentenceComplete = options.onSentenceComplete;

    this.displayedText = "";
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.currentTextIndex = 0;
    this.isVisible = !this.startOnVisible;
    this.timeoutId = null;
    this.cursorTween = null;
    this.observer = null;

    this.contentEl = null;
    this.cursorEl = null;

    this.init();
  }

  init() {
    this.root.classList.add("text-type");
    this.root.innerHTML = "";

    this.contentEl = document.createElement("span");
    this.contentEl.className = "text-type__content";
    this.root.appendChild(this.contentEl);

    if (this.showCursor) {
      this.cursorEl = document.createElement("span");
      this.cursorEl.className = `text-type__cursor ${this.cursorClassName}`.trim();
      this.cursorEl.textContent = this.cursorCharacter;
      this.root.appendChild(this.cursorEl);
      this.animateCursor();
    }

    if (this.startOnVisible) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.isVisible = true;
              this.tick();
              this.observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      this.observer.observe(this.root);
      return;
    }

    this.tick();
  }

  getRandomSpeed() {
    if (!this.variableSpeed) return this.typingSpeed;
    const { min, max } = this.variableSpeed;
    return Math.random() * (max - min) + min;
  }

  getCurrentTextColor() {
    if (this.textColors.length === 0) return "inherit";
    return this.textColors[this.currentTextIndex % this.textColors.length];
  }

  animateCursor() {
    if (!this.showCursor || !this.cursorEl || typeof gsap === "undefined") return;

    gsap.set(this.cursorEl, { opacity: 1 });
    this.cursorTween = gsap.to(this.cursorEl, {
      opacity: 0,
      duration: this.cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
  }

  updateCursorVisibility() {
    if (!this.cursorEl) return;

    const currentText = this.text[this.currentTextIndex] ?? "";
    const shouldHide =
      this.hideCursorWhileTyping &&
      (this.currentCharIndex < currentText.length || this.isDeleting);

    this.cursorEl.classList.toggle("text-type__cursor--hidden", shouldHide);
  }

  render() {
    this.contentEl.textContent = this.displayedText;

    if (this.textColors.length > 0) {
      this.contentEl.style.color = this.getCurrentTextColor();
      this.contentEl.style.background = "none";
      this.contentEl.style.webkitBackgroundClip = "unset";
      this.contentEl.style.backgroundClip = "unset";
    }

    this.updateCursorVisibility();
  }

  tick() {
    if (!this.isVisible) return;

    clearTimeout(this.timeoutId);

    const currentText = this.text[this.currentTextIndex] ?? "";
    const processedText = this.reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const run = () => {
      if (this.isDeleting) {
        if (this.displayedText === "") {
          this.isDeleting = false;

          if (this.currentTextIndex === this.text.length - 1 && !this.loop) {
            this.render();
            return;
          }

          if (typeof this.onSentenceComplete === "function") {
            this.onSentenceComplete(this.text[this.currentTextIndex], this.currentTextIndex);
          }

          this.currentTextIndex = (this.currentTextIndex + 1) % this.text.length;
          this.currentCharIndex = 0;
          this.render();
          this.timeoutId = setTimeout(run, this.pauseDuration);
        } else {
          this.timeoutId = setTimeout(() => {
            this.displayedText = this.displayedText.slice(0, -1);
            this.render();
            this.tick();
          }, this.deletingSpeed);
        }
        return;
      }

      if (this.currentCharIndex < processedText.length) {
        const delay = this.variableSpeed ? this.getRandomSpeed() : this.typingSpeed;
        this.timeoutId = setTimeout(() => {
          this.displayedText += processedText[this.currentCharIndex];
          this.currentCharIndex += 1;
          this.render();
          this.tick();
        }, delay);
        return;
      }

      if (this.text.length >= 1) {
        if (!this.loop && this.currentTextIndex === this.text.length - 1) {
          this.render();
          return;
        }

        this.timeoutId = setTimeout(() => {
          this.isDeleting = true;
          this.tick();
        }, this.pauseDuration);
      }
    };

    if (this.currentCharIndex === 0 && !this.isDeleting && this.displayedText === "") {
      this.timeoutId = setTimeout(run, this.initialDelay);
    } else {
      run();
    }
  }

  destroy() {
    clearTimeout(this.timeoutId);
    if (this.cursorTween) this.cursorTween.kill();
    if (this.observer) this.observer.disconnect();
  }
}

window.TextType = TextType;
