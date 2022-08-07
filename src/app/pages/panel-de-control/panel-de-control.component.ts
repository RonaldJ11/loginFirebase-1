import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DataBaseService } from 'src/app/services/database.service';
// import { Client as ConversationsClient } from "@twilio/conversations";
import { Client, Message } from "@twilio/conversations";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-panel-de-control',
  templateUrl: './panel-de-control.component.html',
  styleUrls: ['./panel-de-control.component.css']
})
export class PanelDeControlComponent implements OnInit {
  mostrarConfirmacion = false;
  codigoIngresado = "";
  codigoDeVerificacion = "multitask4013"
  usuarios: any;
  listaDesordenada: any;
  sorteo: any;
  userLogged: any;

  clientTwilio: any;

  userLogin = "";
  conversationsClient: any;
  conversationsList = new Array();
  messageList: Array<Message> = [];
  conversationSelected: any;
  conversationProxy = "";

  nameConversation: any;
  messageConversation: any;

  constructor(private database: DataBaseService,
    private authService: AuthService) {
    this.authService.getUserLogged().subscribe(res => {
      this.userLogged = res;
    })
  }

  ngOnInit(): void {
    this.database.obtenerTodos('users').subscribe(usuariosRef => {
      this.usuarios = usuariosRef.map(userRef => {
        let usuario: any = userRef.payload.doc.data();
        usuario['id'] = userRef.payload.doc.id;
        return usuario;
      });
    })

    this.database.obtenerTodos('sorteos').subscribe(sorteosRef => {
      this.sorteo = sorteosRef.map(userRef => {
        let usuario: any = userRef.payload.doc.data();
        usuario['id'] = userRef.payload.doc.id;
        return usuario;
      });
      console.log("SORTEO ", this.sorteo[0]);
    })

    const myToken = localStorage.getItem("token");
    console.log(myToken);
    // alert(myToken)
    this.initConversations();
  }

  change(value: string): void {
    console.log(value);

  }

  loadMessages = async (sid: string) => {
    this.conversationSelected = sid;
    this.messageList = new Array();
    var list = this.conversationsList.find(r => r.sid == sid);
    list.getMessages().then((messagePaginator: any) =>
      this.messageList = messagePaginator.items
    )
    this.update()
  }

  update = () => {
    var client = this.clientTwilio;
    client.on('messageAdded', (m: any) => {
      // alert('si entro')
      // console.log(myToken);
      var list = this.conversationsList.find(r => r.sid == this.conversationSelected);
      list.getMessages().then((messagePaginator: any) =>
        this.messageList = messagePaginator.items
      )
    }
    );
  }
  // loadMessagesFor = (thisConversation) => {
  //   if (this.conversationProxy === thisConversation) {
  //       thisConversation.getMessages()
  //           .then(messagePaginator => {
  //               if (this.state.conversationProxy === thisConversation) {
  //                   this.setState({ messages: messagePaginator.items, loadingState: 'ready' });
  //               }
  //           })
  //           .catch(err => {
  //               console.error("Couldn't fetch messages IMPLEMENT RETRY", err);
  //               this.setState({ loadingState: "failed" });
  //           });
  //   }
  // };


  initConversations = async () => {
    const myToken = localStorage.getItem("token");
    this.userLogin = localStorage.getItem("name") || '';
    console.log(this.userLogin);
    const client = new Client(myToken || "");

    this.clientTwilio = client;

    client.on("conversationJoined", (conversation) => {
      // console.log(conversation.friendlyName);
      this.conversationsList.push(conversation);

      // console.error(conversation.getMessages());

    });

    client.on("conversationLeft", (thisConversation) => {

      this.conversationsList.filter((it) => it !== thisConversation)
    });
  };

  addConversation(): void {
    console.log(this.nameConversation);
    var objects = JSON.stringify({ IdChanel: this.nameConversation, idUser: this.userLogin })
    const options = {
      method: 'POST',
      headers: { accept: '*/*', 'Content-Type': 'application/json' },
      body: objects
    };

    fetch('https://twilioconversation20220802094045.azurewebsites.net/addConversationByUser', options)
      .then(response => response.json())
      .then(response =>
        Swal.fire({
          title: 'Finalizado Copia el link y pasalo a la otra conversacion',
          text: 'https://lemon-beach-016389a10.1.azurestaticapps.net/login/' + response,
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: 'OK',
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            Swal.fire('Saved!', '', 'success')
          } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info')
          }
        })
      )
      .catch(err => console.error(err));

  };

  sendmessage(): void {

    var author = this.userLogin;
    var message = this.messageConversation;
    var idCanal = this.conversationSelected;

    // console.log('author', author);

    // console.log('message', message);

    // console.log('idCanal', idCanal);

    var objects = JSON.stringify({ author: author, message: message, idCanal: idCanal })

    const options = {
      method: 'POST',
      headers: { accept: '*/*', 'Content-Type': 'application/json' },
      body: objects
    };

    fetch('https://twilioconversation20220802094045.azurewebsites.net/sendmessage', options)
      .then(response => response.json())
      .then(response =>{
        console.log(response)
        this.messageConversation = ''}
      )
      .catch(err => console.error(err));
  }
}
