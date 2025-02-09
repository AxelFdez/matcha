
class UserProfile {
	constructor(user){
		this.username = user.username;
		this.firstname = user.firstname;
		this.lastname = user.lastname;
		this.connected = user.connected;
		this.verified = user.verified;
		this.ready = user.ready;
		this.email = user.email;
		this.lastConnection = user.lastConnection;
		this.gender = user.gender;
		this.sexualPreferences = user.sexualPreferences;
		this.biography = user.biography;
		this.age = user.age;
		this.interests = user.interests;
		this.photos = user.photos;
		this.profilePicture = user.profilePicture;
		this.fameRating = user.fameRating;
		this.location = user.location;
		this.createdAt = user.createdAt;
	}

	getProfile(){
		return {
			username: this.username,
			firstname: this.firstname,
			lastname: this.lastname,
			email : this.email,
			connected: this.connected,
			verified: this.verified,
			ready: this.ready,
			lastConnection: this.lastConnection,
			gender: this.gender,
			sexualPreferences: this.sexualPreferences,
			biography: this.biography,
			age: this.age,
			interests: this.interests,
			photos: this.photos,
			profilePicture: this.profilePicture,
			fameRating: this.fameRating,
			location: this.location,
			createdAt: this.createdAt
		};
	}

}

module.exports = UserProfile;