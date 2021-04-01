class FJDropBox{
    constructor(){
        this.currentFolder = ['Home']
        
        this.onselectionchange = new Event('selectionchange')
        this.navEl = document.querySelector('#path');
        this.inputFilesEl = document.querySelector('#files')
        this.btnSendFileEl = document.querySelector('#btn-send')
        this.btnNewFolder = document.querySelector('#newfolder')
        this.btnRename = document.querySelector('#rename')
        this.btnDelete = document.querySelector('#delete')

        this.listFilesEl = document.querySelector('#list-files')

        this.connectFireBase()

        this.initEvents()

    }
    connectFireBase(){
        var firebaseConfig = {
            apiKey: "AIzaSyBSOE0aALdj2FDvGvwiVteybgKJt6CBFp8",
            authDomain: "fj---dropbox.firebaseapp.com",
            databaseUrl: "https://fj---dropbox-default-rtdb.firebaseio.com/",
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
        this.btnNewFolder.addEventListener('click', e=>{
            console.log('Fui clicado')
            let name = prompt('Nome da nova pasta:');
            if(name){
                this.getFirebaseRef().push().set({
                    name,
                    type: 'folder',
                    path: this.currentFolder.join('/')
                })
            }
        })

        this.btnDelete.addEventListener('click',e=>{
            this.removeTask().then(responses=>{
                responses.forEach(response=>{
                    if(response.fields.key){
                        this.getFirebaseRef().child(response.fields.key).remove()
                    }
                })
            }).catch(err=>{
                console.error(err)
            })
        })

        this.btnRename.addEventListener('click', e=>{
            let li=this.getSelection()[0]

            let file=JSON.parse(li.dataset.file)
            
            let name = prompt('Renomear arquivo:',file.name)

            if(name){
                file.name = name
                this.getFirebaseRef().child(li.dataset.key.set(file))
            }
        })

        this.listFilesEl.addEventListener('selectionchange', e=>{
            switch(this.getSelection().length){
                case 0:
                    this.btnDelete.style.display = 'none';
                    this.btnRename.style.display = 'none';
                break;

                case 1:
                    this.btnDelete.style.display = 'block';
                    this.btnRename.style.display = 'block';
                break;

                default:
                    this.btnDelete.style.display = 'block';
                    this.btnRename.style.display = 'none';

            }
        })

        this.btnSendFileEl.addEventListener('click', event=>{
            console.log('clicado')
            this.inputFilesEl.click()
        })
        this.inputFilesEl.addEventListener('change',event=>{
            this.btnSendFileEl.disabled=true

            this.uploadTask(event.target.files).then(responses=>{
                responses.forEach(resp=>{
                    resp.ref.getDownloadURL().then(data=>{
                        this.getFirebaseRef().push().set({
                            name:resp.name,
                            type:resp.contentType,
                            path: data,
                            size: resp.size
                        })
                    })
                })
                this.uploadComplete()
            }).catch(err=>{
                this.uploadComplete()
                console.log(err)
            })
        })
    }

    uploadCOmplete(){
        this.modalShow(false)
        this.inputFilesEl.value = '';
        this.btnSendFileEl.disabled = false
    }

    getFirebaseRef(path){
        if(!path) path = this.currentFolder.join('/')
        return firebase.database().ref(path)
    }

    ajax(ult, method='GET', formData = new FormData(), onprogress=function(){}, onloadstart=function(){}){
        return new Promise((resolve, reject)=>{
            let ajax = new XMLHttpRequest()
            ajax.open(method, url)
            ajax.onload = event=>{
                try{
                    resolve(JSON.parse(ajax.responseText))
                }catch(e){
                    reject(e)
                }
            }
            ajax.onerror = event=>{
                reject(event)
            }
            ajax.upload.onprogress = onprogress

            onloadstart()
            ajax.send(formData)
        })
    }
    
    uploadTask(files){
        let promises = [];

        [...files].forEach(file=>{
            promises.push(new Promise((resolve,reject)=>{
                let fileRef = firebase.storage().ref(this.currentFolder.join('/')).child(file.name);
            
                let task = fileRef.put(file)

                task.on('state_changed',snapshot=>{
                    this.uploadProgress({
                        loaded: snapshot.bytesTransferred,
                        total: snapshot.totalBytes
                    }, file)
                },error=>{
                    console.error(error)
                    reject(error)
                },()=>{
                    fileRef.getMetadata().then(metadata=>{
                        resolve(metadata)
                    }).catch(err=>{
                        console.log(err)
                        reject(err)
                    })
                })
            
            }))
        })
        return Promise.all(promises)
    }
    getFileImage(file){
        switch(file.type){
            case 'folder':
                return `
                    <img src="images/folder.png" alt="" srcset="">
                `;
                break;
            case 'application/pdf':
                return `
                    <img src="images/document.png" alt="" srcset="">
                `;
                break;
            case 'audio/mp3':
            case 'audio/ogg':
                return `
                    <img src="images/image.png" alt="" srcset="">
                `;
                break;
            case 'video/mp4':
            case 'video/quicktime':
                return `
                    <img src="images/video.png" alt="" srcset="">
                `
                break;
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/png':
            case 'image/gif':
                return `
                    <img src="images/video.png" alt="" srcset="">
                `
                break;
            default:
                return `
                    <img src="images/error.png" alt="" srcset="">
                `;
        }
    }
    getFileView(file,key){
        let li = document.createElement('li')

        li.dataset.key=key;
        li.dataset.file = JSON.stringify(file)

        li.innerHTML = `
              <div class="image-box">
                ${this.getFileImage(file)}
              </div>
              <div class="name-box">
                <p>${file.name}</p>
            </div>
        `
        this.initEventsLi(li)
        return li
    }
    initEventsLi(li){
        li.addEventListener('dblclick', e=>{
            let file = JSON.parse(li.dataset.file)
            switch(file.type){
                case 'folder':
                    this.currentFolder.push(file.name)
                    this.openFolder();
                    break;
                default:
                    window.open(file.path)
            }
        })
        li.addEventListener('click', e=>{
            if(e.shitKey){
                let firstLi = this.listFilesEl.querySelector('li.selected')

                if(firstLi){
                    let indexStart;
                    let indexEnd;
                    let lis= li.parentElement.childNodes;

                    lis.forEach((el,index)=>{
                        if(firstLi===el) indexStart=index
                        if(li === el) indexEnd=index
                    })
                    let index=[indexStart,indexEnd].sort()

                    lis.forEach((el,i)=>{
                        if(i>=index[0]&&i<=index[1]) el.classList.add('selected')
                    })
                    this.listFilesEl.dispatchEvent(this.onselectionchange)
                    return true
                }
            }
            if(!e.ctrlKey){
                this.listFilesEl.querySelectorAll('li.selected').forEach(el=>{
                    el.classList.remove('selected')
                })
            }
            li.classList.toggle('selected')
            this.listFilesEl.dispatchEvent(this.onselectionchange)
        })
    }
}