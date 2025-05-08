import AboutPresenter from "./about-presenter.js";

export default class AboutPage {
  constructor() {
    this._presenter = new AboutPresenter(this);
  }

  async render() {
    const aboutInfo = this._presenter.getAboutInfo();

    return `
      <section class="container about-section" tabindex="0" aria-label="${aboutInfo.title}">
        <h1 class="about-title">${aboutInfo.title}</h1>
        <div class="about-card">
          <img src="${aboutInfo.photo}" alt="Foto Pembuat" class="about-photo" />
          <div class="about-details">
            <h2 class="about-name">${aboutInfo.name}</h2>
            <p class="about-info">Tahun Lahir: ${aboutInfo.birthYear}</p>
            <p class="about-info">Asal Universitas: ${aboutInfo.university}</p>
            <p class="about-caption">"${aboutInfo.caption}"</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada logika tambahan untuk halaman ini
  }
}
