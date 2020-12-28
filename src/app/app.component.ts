import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {DataService} from "./data.service";
import { FormBuilder } from '@angular/forms';
import {MatPaginator,MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

declare function JoinRoom(): any;
declare function GoToMenu(): any;
declare function StartMultiplayer(params1:number, params2:number, params3:number): any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit,AfterViewInit {
  title = 'breakout';
  scores: any = [];
  rooms: RoomDump[] = [];
  player : Player
  room : Room;
  roomForm;
  joinForm;
  dataSource: MatTableDataSource<RoomDump> = new MatTableDataSource<RoomDump>(this.rooms);
  displayedColumns: string[] = ['room_name', 'players', 'password', 'isJoin'];
  numberOfPlayers:number = 0;
  playerNumber:number = 0;

  constructor(private dataService: DataService, private formBuilder: FormBuilder,) {
    this.roomForm = this.formBuilder.group({
      room_name: '',
      player_name: '',
      password:''
    });
    this.joinForm = this.formBuilder.group({
      roomId: '',
      playerName: '',
      roomPassword:''
    });
    this.room ={room_id:-1, room_name:"", room_password: false, player1:"", player2:"", player3:"", player4:""};
    this.player = {player_id:-1, player_name:""}
  }

  // @ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;


  ngOnInit() {
    this.dataService.getScores().subscribe(data => this.scores = data);
    this.dataService.getRooms().subscribe(data => {
      this.rooms = data;
      console.log(new MatTableDataSource<RoomDump>(this.rooms));
      this.dataSource = new MatTableDataSource<RoomDump>(this.rooms);
      this.paginator.pageSize = 10;
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource.paginator);
    });

  }

  ngAfterViewInit() {

  }

  onCreateRoomSubmit(data1: any) {
    this.dataService.createPlayer(data1.player_name).subscribe(data  =>{
      this.player = {player_id:data.player_id, player_name:data.player_name}
      console.log(data);

      this.dataService.postRooms({room_name: data1.room_name, player_id: this.player.player_id, password: data1.password}).subscribe(data  =>{
        this.room = data;
        this.numberOfPlayers = 1;
        this.playerNumber = 1;
        console.log(data);
        StartMultiplayer(this.room.room_id, this.player.player_id, this.playerNumber);
      });
    });
  }

  onJoinRoomSubmit(data1: any) {
    this.dataService.createPlayer(data1.playerName).subscribe(data  =>{
      this.player = data
      console.log(data);

      this.dataService.joinRoom({room_id: this.room.room_id, player_id: this.player.player_id, roomPassword: data1.roomPassword}).subscribe(data  =>{
        this.room = data;
        let tmp = 0;
        tmp += this.room.player1 != null ? 1 : 0;
        tmp += this.room.player2 != null ? 1 : 0;
        tmp += this.room.player3 != null ? 1 : 0;
        tmp += this.room.player4 != null ? 1 : 0;
        this.numberOfPlayers = tmp;
        console.log(data);
        this.dataService.getPlayerNumber(this.room.room_id, this.player.player_id).subscribe(data  =>{
          this.playerNumber = data.playerNumber;
          console.log(this.playerNumber);
          StartMultiplayer(this.room.room_id, this.player.player_id, this.playerNumber);
        });
      });
    });
  }

  @HostListener('window:onScoreSubmit', ['$event.detail'])
  public onScoreSubmit(detail: any) {
    console.log(detail)
    this.dataService.postScore(detail.player_name, detail.score).subscribe(data=>{
      GoToMenu()
    });
  }

  @HostListener('window:refreshScores')
  public refreshScores() {
    this.dataService.getScores().subscribe(data => this.scores = data);
  }

  public refreshRooms() {
    this.dataService.getRooms().subscribe(data => this.rooms = data);
    this.dataSource = new MatTableDataSource<RoomDump>(this.rooms);
    this.paginator.pageSize = 10;
    this.dataSource.paginator = this.paginator;
  }

  @HostListener('window:refreshRoom')
  public refreshRoom() {
    console.log("refreshing room ...");
    this.dataService.getRoom(this.room.room_id).subscribe(data => {
      this.room = data;
      let tmp = 0;
      tmp += this.room.player1 != null ? 1 : 0;
      tmp += this.room.player2 != null ? 1 : 0;
      tmp += this.room.player3 != null ? 1 : 0;
      tmp += this.room.player4 != null ? 1 : 0;
      this.numberOfPlayers = tmp;
      console.log(data);
      console.log(tmp);
    });
  }

  public joinRoom(id: number, name: string, password: boolean) {
    JoinRoom();
    this.room={room_id:id, room_name:name, room_password: password, player1:"", player2:"", player3:"", player4:""};
    console.log(this.room)
  }

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
interface Player {
  player_id: number;
  player_name: string;
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
