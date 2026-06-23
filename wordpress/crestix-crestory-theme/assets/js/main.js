(() => {
  const hamburger = document.getElementById("cx-hamburger");
  const drawer = document.getElementById("cx-drawer");

  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const tabs = document.querySelectorAll("#cx-tabs [data-cat]");
  const cards = document.querySelectorAll("#cx-grid .crestory-card");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");

      const cat = tab.dataset.cat;
      cards.forEach((card) => {
        const cats = (card.dataset.cats || "").split(" ").filter(Boolean);
        card.style.display = cat === "all" || cats.includes(cat) ? "" : "none";
      });
    });
  });

  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const colors = [
    "rgba(255,92,0,0.12)",
    "rgba(26,43,76,0.2)",
    "rgba(255,255,255,0.07)",
  ];
  const types = ["triangle", "square", "hexagon", "line"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let shapes = [];
  let frameId = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createShapes(rect.width, rect.height);
  }

  function createShapes(width, height) {
    const count = Math.floor((width * height) / 42000) + 8;
    shapes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 60 + 20,
      type: types[Math.floor(Math.random() * types.length)],
      angle: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      va: (Math.random() - 0.5) * 0.003,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }

  function drawShape(shape) {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.angle);
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    if (shape.type === "triangle") {
      const h = (shape.size * Math.sqrt(3)) / 2;
      ctx.moveTo(0, -h * 0.667);
      ctx.lineTo(shape.size / 2, h * 0.333);
      ctx.lineTo(-shape.size / 2, h * 0.333);
      ctx.closePath();
    } else if (shape.type === "square") {
      ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
    } else if (shape.type === "hexagon") {
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = Math.cos(angle) * shape.size / 2;
        const y = Math.sin(angle) * shape.size / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(-shape.size / 2, 0);
      ctx.lineTo(shape.size / 2, 0);
    }

    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    shapes.forEach(drawShape);
  }

  function tick() {
    const rect = canvas.getBoundingClientRect();
    shapes.forEach((shape) => {
      shape.x += shape.vx;
      shape.y += shape.vy;
      shape.angle += shape.va;

      if (shape.x < -100) shape.x = rect.width + 100;
      if (shape.x > rect.width + 100) shape.x = -100;
      if (shape.y < -100) shape.y = rect.height + 100;
      if (shape.y > rect.height + 100) shape.y = -100;
    });
    draw();
    frameId = window.requestAnimationFrame(tick);
  }

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  if (!reduceMotion) tick();
  window.addEventListener("pagehide", () => {
    if (frameId) window.cancelAnimationFrame(frameId);
  });
})();
