import { Component, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush, SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pwa-demo';
  availableUpdate = false;
  items = [];

  constructor(
    private httpClient: HttpClient,
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef) {
    this.httpClient.get<any>('http://localhost:3000/items').subscribe((data) => {
      this.items = data;
    });

    /* SW UPDATE BY TIME INTERVAL */
    /*
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    everySixHoursOnceAppIsStable$.subscribe(() => this.updates.checkForUpdate().then(() => console.log('Check Updated SW')));
    */

    /* SW UPDATED Observable */
    this.swUpdate.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
      this.availableUpdate = true;
    });

    this.swUpdate.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });


    /* PUSH NOTIFICATION */
    const serverUrl = 'http://localhost:3001/subscription';
    if (this.swPush.isEnabled) {
      this.swPush
        .requestSubscription({
          serverPublicKey: 'BIqICK8-r73XwpqZ0kEGfStiXfnQElco5ae3ko6YKWmN-Q51aWCN8MyiOknGh6VNnV79mAQVSo3hYskBKoetK88',
        })
        .then(subscription => {
          this.httpClient.post(serverUrl, subscription).subscribe();
        })
        .catch(console.error);
    }

    this.swPush.notificationClicks.subscribe(event => {
      console.log('Received notification: ', event);
    });
  }

  /* FORCE CHECK SW UPDATE */
  checkSwUpdate() {
    this.swUpdate.checkForUpdate().then(() => console.log('Check Updated SW'));
  }

  /* FORCE SW UPDATE */
  updateSw() {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
