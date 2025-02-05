import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { signUp } from 'aws-amplify/auth';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'questionari';

  async signUpP() {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: 'hello@mycompany.com',
      password: 'Abc123456@',
      options: {
        userAttributes: {
          email: 'hello@mycompany.com',
          phone_number: '+3022135761',
          preferred_username: 'aaaaa',
        },
      },
    });
  }
}
