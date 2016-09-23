// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	console.log(result);
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var getAnswered = function(tags) {
	var request = {
		tag: tags,
		time: "all_time"
	};

	$.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + request.tag + "/top-answerers/" + request.time + "?site=stackoverflow",
		data: request,
		dataType: "jsonp",
		type: "GET",
	})
	.done(function(result) {
		
		var searchResults = showSearchResults(request.tag, result.items.length);

		$('.search-results').html(searchResults);
		
		$.each(result.items, function(i, item) {

			//Calls and appends each template to the DOM
			var answerer = showAnswerer(item);
			$('.results').append(answerer);

		});
		//Resets the rank counter so that each time a new tag is searched for the top rank is 1
		rank_counter = 0;
	})
}
	//Global variable for listing the users on the page with a "rank"
	var rank_counter = 0;

//This function edits a cloned template for showing the top users 
var showAnswerer = function(profile) {

	rank_counter++;
	var result = $('.templates .answerer').clone();
	
	//Sets the users profile image
	var user_image = result.find('.user-image');
	user_image.attr('src', profile.user.profile_image);

	//Sets the users "rank"
	var user_rank = result.find('.rank');
	user_rank.text(rank_counter);

	//Sets the users username and adds a link to his profile
	var user_name = result.find('.user-name');
	user_name.attr('href', profile.user.link);
	user_name.text(profile.user.display_name);

	//Sets the users reputation
	var user_rep = result.find('.rep');
	user_rep.text('(Reputation: ' + profile.user.reputation + ')');

	//Sets the users score
	var user_score = result.find('.score');
	user_score.text('Score: ' + profile.score);

	//Sets the users post count
	var user_count = result.find('.post-count');
	user_count.text('Post Count: ' + profile.post_count);

	//Returns the fully cloned and edited template
	return result;	
};


$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

	$('.inspiration-getter').submit( function(e) {
		e.preventDefault();

		$('.results').html('');
		var tags = $(this).find("input[name='answerers']").val();
		getAnswered(tags);

	});
});
