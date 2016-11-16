//SimpleChat Server
//Author Name: Dustin Harris
//Email:dmhzmxn@gmail.com
//*********************************
//
//
var Version = "0.0.1"
//Connection timeout in milliseconds
var ConnectionTimeout = 8000
//Timeout check rate
var ConnectionTimeoutRate = 1000
//Include DevLord Libs.
//*********************
var StringForm = require('./StringForm.js')

//Include 3RD Party Libs.
//***********************

//Hold connected clients
var Clients = []

setInterval(function () {
    TimeoutClients()
}, ConnectionTimeoutRate);
var ConnectionCount = 0

function PostChat_Encoded(Str){
			var responsestr = ""
			try {
				var ParsedMessage = decodeURIComponent(Str.split('*P*')[0])
				var Command = ParsedMessage.split("~")[0]
				if (Command == "connect"){
				    var UserName = ParsedMessage.split("~")[1]
				    responsestr = Connect(UserName.replace("+", " "))
				} else if (Command == "disconnect") {
					var SessionID = ParsedMessage.split("~")[1]
					Disconnect(SessionID)
				} else if (Command == "joinroom") {
				    var RoomName = ParsedMessage.split("~")[1]
				    if (Rooms.RoomExists(RoomName)) {
                        var SessionID = ParsedMessage.split("~")[2]
				        var RoomID = Rooms.GetRoomIndex(RoomName)
				        responsestr = Rooms.Room[RoomID].AddMember(SessionID)
				    } else {
				        responsestr = "[ ]-[ ] Room not found."
				    }
				} else if (Command == "leavegroup") {
				    var RoomName = ParsedMessage.split("~")[1]
				    if (Rooms.RoomExists(RoomName)) {
				        var SessionID = ParsedMessage.split("~")[2]
				        var RoomID = Rooms.GetRoomIndex(RoomName)
				        responsestr = Rooms.Room[RoomID].DelMember(SessionID)
				    } else {
				        responsestr = "[ ]-[ ] Failed to leave room. Room not found."
				    }
					
				}  else if (Command == "getchatlength") {
					var RoomName = ParsedMessage.split("~")[1]
					if (Rooms.RoomExists(RoomName)){
						var RoomID = Rooms.GetRoomIndex(RoomName)
						responsestr = Rooms.Room[RoomID].ChatLog.Length()
					} else {
					    responsestr = "notfound"
					}
				}	else if (Command == "getchat") {
					var RoomName = ParsedMessage.split("~")[1]
					if (Rooms.RoomExists(RoomName)) {
					    var RoomID = Rooms.GetRoomIndex(RoomName)
					    var SessionID = ParsedMessage.split("~")[2]
					    var Start = ParsedMessage.split("~")[3]
					    responsestr = Rooms.Room[RoomID].GetChat(SessionID, Start)
					} else {
					    responsestr = "[ ]-[ ] Failed to get chat, Room not found."
					}
				} else if (Command == "postchat") {
					var RoomName = ParsedMessage.split("~")[1]
						if (Rooms.RoomExists(RoomName)) {
							var SessionID = ParsedMessage.split("~")[2]
							var MSG = ParsedMessage.split("~")[3]
							var RoomID = Rooms.GetRoomIndex(RoomName)
				            responsestr = Rooms.Room[RoomID].PostMSG(SessionID, MSG)
						} else {
							responsestr = "[ ]-[ ] Failed to post message, Room not found."
						}
				} else if (Command == "ping") {
				    var SessionID = ParsedMessage.split("~")[1]
				    responsestr = Ping(SessionID)
				} else if (Command == "changeaux") {
				    var RoomName = ParsedMessage.split("~")[2]
				    if (Rooms.RoomExists(RoomName)) {
				        var SessionID = ParsedMessage.split("~")[1]
				        var RoomID = Rooms.GetRoomIndex(RoomName)
				        var FromAux = ParsedMessage.split("~")[3]
				        var ToAux = ParsedMessage.split("~")[4]
				        if (UserIsConnected_SID(SessionID)) {
				            responsestr = Rooms.Room[RoomID].PostMSG("Server", "[" + GetUserName(SessionID) + "]  " + "[" + FromAux + "] -> [" + ToAux + "]")
				        } else {
				            responsestr = "[ ]-[ ] You must be logged in to perform this action."
				        }
				        
				    } else {
				        responsestr = "notfound"
				    }
				    responsestr = Ping(SessionID)
				} else if (Command == "getmembers") {
				    var RoomName = ParsedMessage.split("~")[1]
				    if (Rooms.RoomExists(RoomName)) {
				        var RoomID = Rooms.GetRoomIndex(RoomName)
				        var SessionID = ParsedMessage.split("~")[2]
				        responsestr = Rooms.Room[RoomID].GetMembers(SessionID)
				    } else {
				        responsestr = "notfound"
				    }
				}
			} catch (err){
				console.log(err);
			}
			return responsestr
}
//List all public objects
exports.PostChat_Encoded = PostChat_Encoded;

//Private

//HoldsChatRooms
var Rooms = {
    Room: [],
    RoomExists: function (RoomName) {
        var Exists = false
        for (var i = 0, len = this.Room.length; i < len; i++) {
            if (RoomName == this.Room[i].Name) {
                Exists = true
                break;
            }
        }
        return Exists;
    },
    AddRoom: function (Name, Owner) {
        if (this.RoomExists(Name) == false) {
            this.Room.push(RoomObj)
            var roomIndex = this.Room.length - 1
            this.Room[roomIndex].Name = Name
            this.Room[roomIndex].Owner = Owner
            this.Room[roomIndex].ChatLog.Log.push("[Server]-[ ] Room (" + Name + ") created!")
            console.log("[Server] Room (" + Name + ") created!")
        }
    },
    GetRoomIndex: function (RoomName) {
        for (var i = 0, len = this.Room.length; i < len; i++) {
            if (RoomName == this.Room[i].Name) {
                return i
                break;
            }
        }
    }
}
function UserIsConnected_UserName(UserName) {
    var Exists = false
    for (var i = 0, len = Clients.length; i < len; i++) {
        if (UserName == Clients[i].UserName) {
            Exists = true
            break;
        }
    }
    return Exists;
}
function UserIsConnected_SID(SessionID) {
    var Exists = false
    for (var i = 0, len = Clients.length; i < len; i++) {
        if (SessionID == Clients[i].SessionID) {
            Exists = true
            break;
        }
    }
    return Exists;
}
function GetUserName(SessionID) {
    var returnstr = ""
    for (var i = 0, len = Clients.length; i < len; i++) {
        if (SessionID == Clients[i].SessionID) {
            returnstr = Clients[i].UserName
            break;
        }
    }
    return returnstr
}
function Ping(SessionID) {
    var returnStr = "notloggedin"
    for (var i = 0, len = Clients.length; i < len; i++) {
        if (SessionID == Clients[i].SessionID) {
            Clients[i].LastPing = new Date().getTime()
            returnStr = "pong"
            
            break;
        }
    }
    return returnStr
}
function Connect(UserName) {
	ConnectionCount += 1
    if (UserIsConnected_UserName(UserName) == false) {
        var newSessionId = new Date().getTime() + ConnectionCount
        Clients.push({ SessionID: newSessionId, LastPing: new Date().getTime(), UserName: UserName })
        console.log("[" + UserName + "] Connected.")
        return newSessionId.toString()
    } else {
        return "[ ]-[ ] You are already logged in from another client."
    }
}

function Disconnect(SessionID) {
        var UpdatedUsers = []
        for (var i = 0, len = Clients.length; i < len; i++) {
            if (SessionID == Clients[i].SessionID) {
                console.log("[" + Clients[i].UserName + "] Disconnected.")
                for (var i2 = 0, len2 = Rooms.Room.length; i2 < len2; i2++) {
                    if (Rooms.Room[i2].MemberExists(Clients[i].UserName)) {
                        Rooms.Room[i2].PostMSG("Server", "[" + Clients[i].UserName + "] Disconnected.")
                        Rooms.Room[i2].DelMember(Clients[i].SessionID)
                    }
                }
            } else {
                UpdatedUsers.push(Clients[i])
            }
        }
        Clients = UpdatedUsers
}

function PostChatInputString(Str){ 
	
}


function TimeoutClients() {
    var CurrentTimeMiliseconds = new Date().getTime()
    var UpdatedUsers = []
    for (var i = 0, len = Clients.length; i < len; i++) {
        try {
            if ((Clients[i].LastPing + ConnectionTimeout) < CurrentTimeMiliseconds) {
                console.log("[" + Clients[i].UserName + "] Timed out.")
                for (var i2 = 0, len2 = Rooms.Room.length; i2 < len2; i2++) {
                    if (Rooms.Room[i2].MemberExists(Clients[i].UserName)) {
                        Rooms.Room[i2].PostMSG("Server", "[" + Clients[i].UserName + "] Timed out.")
                        Rooms.Room[i2].DelMember(Clients[i].SessionID)
                    }
                }
            } else {
                UpdatedUsers.push(Clients[i])
            }
        } catch (err) {
            UpdatedUsers.push(Clients[i])
        }
    }
    Clients = UpdatedUsers
}

    var RoomObj = {
        Name: "",
        Owner: "",
        Members: [],
        ChatLog: {
            Log: [],
            Clear: function () {
                this.Log = [];
            },
            Length: function () {
                return this.Log.length.toString()
            }
        },
        MemberExists: function (MemberName) {
            var Exists = false
            for (var i = 0, len = this.Members.length; i < len; i++) {
                if (MemberName == this.Members[i]) {
                    Exists = true
                    break;
                }
            }
            return Exists;
        },
        GetChat: function (SessionID, Start) {
            var StringRegion = ""
            if (UserIsConnected_SID(SessionID)) {
                var UserName = GetUserName(SessionID)
                var StartIndex = 0
                if (this.MemberExists(UserName)) {
                    for (var i = parseInt(Start), len = this.ChatLog.Log.length; i < len; i++) {
                        try {
                            StringRegion = StringRegion + "|" + this.ChatLog.Log[i]
                        } catch (err) { }
                    }
                } else {
                    StringRegion = "[ ]-[ ] You are not a member of this room."
                }
            } else {
                StringRegion = "[ ]-[ ] You must be logged in to perform this action."
            }
            return StringRegion
        },
        PostMSG: function (SessionID, MSG) {
            var returnStr = ""
            if (UserIsConnected_SID(SessionID) || SessionID == "Server") {
                if (SessionID == "Server") {
                    var From = "Server"
                } else {
                    var From = GetUserName(SessionID)
                }
                if (this.MemberExists(From) || From == "Server") {
						var CommandArray = MSG.split(" ")
				        if (CommandArray[0] == "/clear") {
							if (this.Owner == From){
								this.ChatLog.Clear
								returnStr = this.PostMSG("Server", "[ " + From + "] Chat log cleared.")
							} else {
							    returnStr = "[Server]-[] You do not have permission to clear the chat log."
							}
				        } else if (CommandArray[0] == "/help") {
						    returnStr = "[Server]-[] **********Commands**********\n/clear       Clears the servers chat history\n/help      Returns this help message."
				        } else if (CommandArray[0] == "/say") {
							if (this.Owner == From){
								returnStr = this.PostMSG("Server", MSG.split("/say ")[1])
							} else {
							    returnStr = "[Server]-[] You do not have permission to use the say command."
							}
						} else if (CommandArray[0].charAt(0) == "/") {
				            returnStr = "[ ]-[ ] Invalid command, please type /help for a list of commands."
						} else {
							this.ChatLog.Log.push("[" + From + "]-[" + StringForm.GetTime_AmPm() + "] " + MSG)
							returnStr = "done"
						}
						console.log("[" + this.Name + "] " + "[" + From + "]-[" + StringForm.GetTime_AmPm() + "] " + MSG)
                } else {
                    returnStr = "[ ]-[ ] You are not a member of this room."
                }
            } else {
                returnStr = "[ ]-[ ] You must be logged in to perform this action."
            }
            return returnStr
        },
        AddMember: function (SessionID) {
            var returnStr = "alreadyjoined"
            var UserName = GetUserName(SessionID)
            if (this.MemberExists(UserName) == false) {
                this.Members.push(UserName)
                this.PostMSG("Server", "[" + UserName + "] Joined the chat!")
                returnStr = "done"
            }
            return returnStr
        },
        DelMember: function (SessionID) {
            var returnStr = "notfound"
            var MemberName = GetUserName(SessionID)
            if (this.MemberExists(MemberName)) {
                var UpdatedMembers = []
                for (var i = 0, len = this.Members.length; i < len; i++) {
                    if (MemberName == this.Members[i]) {
                        this.PostMSG("Server", "[" + MemberName + "] Left the chat.")
                        returnStr = "done"
                    } else {
                        UpdatedMembers.push(this.Members[i])
                    }
                }
                this.Members = UpdatedMembers
            }
        },
        GetMembers: function (SessionID) {
            var returnStr = ""
            if (UserIsConnected_SID(SessionID)) {
                var UserName = GetUserName(SessionID)
                if (this.MemberExists(UserName)) {
                    for (var i = 0, len = this.Members.length; i < len; i++) {
                        if (i > 0) {
                            returnStr = returnStr + "|" + this.Members[i]
                        } else {
                            returnStr = this.Members[i]
                        }
                    }
                } else {
                    returnStr = "notamember"
                }
            } else {
                returnStr = "notloggedin"
            }
            return returnStr;
        }
    }

    //Post to console the module loaded
console.log("SimpleChat(" + Version + ") Plugin Loaded!");
Rooms.AddRoom("DashChat", "Dustin Harris")