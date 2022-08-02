import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataBaseService } from 'src/app/services/database.service';
import { Client as ConversationsClient } from "@twilio/conversations";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  usuario = {
    name: '',
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params=>{
      if(params.has('chanel')){
        var channel =params.get('chanel');
        localStorage.setItem("chanel", channel||"")
      }
    })
  }

  constructor(private authService: AuthService, private router: Router,private route:ActivatedRoute) { }

  Ingresar() {

    const { name } = this.usuario;
    if (name !== "") {
      localStorage.setItem("name", name);
      // this.setState({ name, loggedIn: true }, this.getToken);


      const options = {
        method: 'POST',
        headers: {accept: '*/*', 'Content-Type': 'application/json'},
        body: JSON.stringify({ idChanel: localStorage.getItem('chanel'),idUser: name})
      };
      
      fetch('https://twilioconversation20220802094045.azurewebsites.net/addConversationByUser', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
        
      var objects = JSON.stringify({ NameUser: name.trim() })
      fetch(
        "https://twilioconversation20220802094045.azurewebsites.net/addToken", {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: objects
      })
        .then((res) => res.json())
        .then((json) => {
          localStorage.setItem("token", json);
          // alert(json)
          this.router.navigate(['/panelDeControl'])
        }
        )
    }
  }


  logout() {
    this.authService.logout();
  }
}
