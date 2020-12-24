import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private REST_API_SERVER = "https://localhost:8443/";
  response : any;

  constructor(private httpClient: HttpClient) { }

  public getScores(){
    return this.httpClient.get(this.REST_API_SERVER + "scores");
  }

  public getRooms():Observable<RoomDump[]>{
    return this.httpClient.get<RoomDump[]>(this.REST_API_SERVER + "rooms");
  }

  public getRoom(room_id:number):Observable<Room>{
    const headers = { 'content-type': 'application/json'}
    const body = JSON.stringify({room_id:room_id});
    console.log(body)
    return this.httpClient.post<Room>(this.REST_API_SERVER + "room",body,{'headers':headers})
  }

  public postScore(player_name:string, score: number){
    const headers = { 'content-type': 'application/json'}
    const body = JSON.stringify({player_name:player_name, score:score});
    console.log(body)
    return this.httpClient.post(this.REST_API_SERVER + "score",body,{'headers':headers})
  }

  public postRooms(object:roomForm):Observable<Room>{
    const headers = { 'content-type': 'application/json'}
    const body = JSON.stringify(object);
    console.log(body)
    return this.httpClient.post<Room>(this.REST_API_SERVER + "rooms",body,{'headers':headers})
  }

  public getPlayerNumber(roomId:number, playerId:number):Observable<PlayerNumber>{
    const headers = { 'content-type': 'application/json'}
    const body = JSON.stringify({roomId:roomId, playerId:playerId});
    console.log(body)
    return this.httpClient.post<PlayerNumber>(this.REST_API_SERVER + "player-number",body,{'headers':headers})
  }

  public createPlayer(playerName:string):Observable<Player>{
    const headers = { 'content-type': 'application/json'}
    const body = JSON.stringify({playerName:playerName});
    console.log(body)
    return this.httpClient.post<Player>(this.REST_API_SERVER + "player",body,{'headers':headers})
  }

  public joinRoom(object:joinForm):Observable<Room>{
    const headers = { 'content-type': 'application/json'}
    const body = JSON.stringify(object);
    console.log(body)
    return this.httpClient.post<Room>(this.REST_API_SERVER + "players",body,{'headers':headers})
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    console.log(error)
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error}`;
    } else {
      // Server-side errors
      errorMessage = `Error: ${error.error.text}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}

interface PlayerNumber{
  playerNumber: number;
}

interface roomForm {
  room_name: string;
  player_id: number;
  password: string;
}

interface joinForm {
  room_id: number;
  player_id: number;
  roomPassword: string;
}

interface Room {
  room_id: number;
  room_name: string;
  room_password: boolean;
  player1: string;
  player2: string;
  player3: string;
  player4: string;
}

interface RoomDump {
  room_id: number;
  room_name: string;
  players: number;
  password: boolean;
  isJoin: boolean;
  player1: string;
  player2: string;
  player3: string;
  player4: string;
}

interface Player {
  player_id: number;
  player_name: string;
}
