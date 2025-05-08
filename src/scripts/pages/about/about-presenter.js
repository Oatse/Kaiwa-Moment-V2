class AboutPresenter {
  constructor(view) {
    this._view = view;
  }

  getAboutInfo() {
    return {
      title: "Biografi Pembuat",
      photo: "../../images/your-photos.jpg",
      name: "Oatse Rizqy Hendarto",
      birthYear: "2004",
      university: "Universitas Gunadarma",
      caption:
        "Seorang pengembang web yang berdedikasi dengan hasrat besar terhadap teknologi dan desain antarmuka pengguna. Saya berfokus pada pembuatan aplikasi yang ramah pengguna serta estetis yang menginspirasi dan mempermudah kehidupan.",
      detailedBio: `Lahir di Jakarta pada tahun 2004, Rizki Maulana menempuh pendidikan di Universitas Gunadarma dengan jurusan Teknik Informatika. Berbekal semangat belajar yang tinggi dan ketertarikan mendalam pada dunia teknologi,  
          Oatse berkembang menjadi web developer yang andal dengan keahlian di berbagai teknologi frontend dan backend.  
          Selain itu, Oatse aktif dalam komunitas teknologi dan sering berbagi pengetahuan lewat artikel dan workshop.`,
    };
  }
}

export default AboutPresenter;
