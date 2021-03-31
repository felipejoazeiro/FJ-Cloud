class FJDropBox{
    constructor(){
        this.currentFolder = ['Home']
        
        this.navEl = document.querySelector('#path');
        this.btnSendFileEl = document.querySelector('#btn-send')

        this.connectFireBase()

        this.initEvents()

    }
    connectFireBase(){
        var firebaseConfig = {
            apiKey: "AIzaSyBSOE0aALdj2FDvGvwiVteybgKJt6CBFp8",
            authDomain: "fj---dropbox.firebaseapp.com",
            projectId: "fj---dropbox",
            storageBucket: "fj---dropbox.appspot.com",
            messagingSenderId: "464902457297",
            appId: "1:464902457297:web:49484f773e46462caf02f0",
            measurementId: "G-00C4V2PRLC"
          };
          // Initialize Firebase
          firebase.initializeApp(firebaseConfig);
          firebase.analytics();
    }
    initEvents(){
        console.log('iniciado')
    }
}