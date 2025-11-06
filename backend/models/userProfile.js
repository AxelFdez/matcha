
class UserProfile {
	constructor(user){
		this.id = user.id;
		this.username = user.username;
		this.firstname = user.firstname;
		this.lastname = user.lastname;
		this.connected = user.connected;
		this.verified = user.verified;
		this.ready = user.ready;
		this.email = user.email;
		this.lastconnection = user.lastconnection;
		this.gender = user.gender;
		this.sexualpreferences = user.sexualpreferences;
		this.biography = user.biography;
		this.age = user.age;
		this.interests = user.interests;
		this.photos = user.photos;
		this.profilepicture = user.profilepicture;
		this.famerating = user.famerating;
		this.location = user.location;
		this.createdat = user.createdat;
		this.viewedby = user.viewedby;
		this.likedby = user.likedby;
		this.matcha = user.matcha;
		this.blacklist = user.blacklist;
	}

	getProfile(){
		return {
			id: this.id,
			username: this.username,
			firstname: this.firstname,
			lastname: this.lastname,
			email : this.email,
			connected: this.connected,
			verified: this.verified,
			ready: this.ready,
			lastconnection: this.lastconnection,
			gender: this.gender,
			sexualpreferences: this.sexualpreferences,
			biography: this.biography,
			age: this.age,
			interests: this.interests,
			photos: this.photos,
			profilepicture: this.profilepicture,
			famerating: this.famerating,
			location: this.location,
			createdat: this.createdat,
			viewedby: this.viewedby,
			likedby: this.likedby,
			matcha: this.matcha,
			blacklist: this.blacklist
		};
	}

}

module.exports = UserProfile;
