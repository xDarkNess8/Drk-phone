NN.Phone.Settings = {};
NN.Phone.Settings.Background = "default-qbus";
NN.Phone.Settings.OpenedTab = null;
NN.Phone.Settings.Backgrounds = {
    'default-qbus': {
        label: "Standard Qbus"
    }
};

var PressedBackground = null;
var PressedBackgroundObject = null;
var OldBackground = null;
var IsChecked = null;

$(document).on('click', '.settings-app-tab', function(e){
    e.preventDefault();
    var PressedTab = $(this).data("settingstab");

    if (PressedTab == "background") {
        NN.Phone.Animations.TopSlideDown(".settings-"+PressedTab+"-tab", 200, 0);
        NN.Phone.Settings.OpenedTab = PressedTab;
    } else if (PressedTab == "profilepicture") {
        NN.Phone.Animations.TopSlideDown(".settings-"+PressedTab+"-tab", 200, 0);
        NN.Phone.Settings.OpenedTab = PressedTab;
    } else if (PressedTab == "numberrecognition") {
        var checkBoxes = $(".numberrec-box");
        NN.Phone.Data.AnonymousCall = !checkBoxes.prop("checked");
        checkBoxes.prop("checked", NN.Phone.Data.AnonymousCall);

        if (!NN.Phone.Data.AnonymousCall) {
            $("#numberrecognition > p").html('Off');
        } else {
            $("#numberrecognition > p").html('On');
        }
    }
});

$(document).on('click', '#accept-background', function(e){
    e.preventDefault();
    var hasCustomBackground = NN.Phone.Functions.IsBackgroundCustom();

    if (hasCustomBackground === false) {
        NN.Phone.Notifications.Add("fas fa-paint-brush", "Settings", NN.Phone.Settings.Backgrounds[NN.Phone.Settings.Background].label+" is ingesteld!")
        NN.Phone.Animations.TopSlideUp(".settings-"+NN.Phone.Settings.OpenedTab+"-tab", 200, -100);
        $(".phone-background").css({"background-image":"url('https://cdn.discordapp.com/attachments/865713596910272513/902377072306040892/phone.png')"})
    } else {
        NN.Phone.Notifications.Add("fas fa-paint-brush", "Settings", "Personal background set!")
        NN.Phone.Animations.TopSlideUp(".settings-"+NN.Phone.Settings.OpenedTab+"-tab", 200, -100);
        $(".phone-background").css({"background-image":"url('"+NN.Phone.Settings.Background+"')"});
    }

    $.post('https://Drk-phone/SetBackground', JSON.stringify({
        background: NN.Phone.Settings.Background,
    }))
});

NN.Phone.Functions.LoadMetaData = function(MetaData) {
    if (MetaData.background !== null && MetaData.background !== undefined) {
        NN.Phone.Settings.Background = MetaData.background;
    } else {
        NN.Phone.Settings.Background = "default-qbus";
    }

    var hasCustomBackground = NN.Phone.Functions.IsBackgroundCustom();

    if (!hasCustomBackground) {
        $(".phone-background").css({"background-image":"url('https://cdn.discordapp.com/attachments/865713596910272513/902377072306040892/phone.png')"})
    } else {
        $(".phone-background").css({"background-image":"url('https://cdn.discordapp.com/attachments/865713596910272513/902377072306040892/phone.png')"});
    }

    if (MetaData.profilepicture == "default") {
        $("[data-settingstab='profilepicture']").find('.settings-tab-icon').html('<img src="./img/default.png">');
    } else {
        $("[data-settingstab='profilepicture']").find('.settings-tab-icon').html('<img src="'+MetaData.profilepicture+'">');
    }
}

$(document).on('click', '#cancel-background', function(e){
    e.preventDefault();
    NN.Phone.Animations.TopSlideUp(".settings-"+NN.Phone.Settings.OpenedTab+"-tab", 200, -100);
});

NN.Phone.Functions.IsBackgroundCustom = function() {
    var retval = true;
    $.each(NN.Phone.Settings.Backgrounds, function(i, background){
        if (NN.Phone.Settings.Background == i) {
            retval = false;
        }
    });
    return retval
}

$(document).on('click', '.background-option', function(e){
    e.preventDefault();
    PressedBackground = $(this).data('background');
    PressedBackgroundObject = this;
    OldBackground = $(this).parent().find('.background-option-current');
    IsChecked = $(this).find('.background-option-current');

    if (IsChecked.length === 0) {
        if (PressedBackground != "custom-background") {
            NN.Phone.Settings.Background = PressedBackground;
            $(OldBackground).fadeOut(50, function(){
                $(OldBackground).remove();
            });
            $(PressedBackgroundObject).append('<div class="background-option-current"><i class="fas fa-check-circle"></i></div>');
        } else {
            NN.Phone.Animations.TopSlideDown(".background-custom", 200, 13);
        }
    }
});

$(document).on('click', '#accept-custom-background', function(e){
    e.preventDefault();

    NN.Phone.Settings.Background = $(".custom-background-input").val();
    $(OldBackground).fadeOut(50, function(){
        $(OldBackground).remove();
    });
    $(PressedBackgroundObject).append('<div class="background-option-current"><i class="fas fa-check-circle"></i></div>');
    NN.Phone.Animations.TopSlideUp(".background-custom", 200, -23);
});

$(document).on('click', '#cancel-custom-background', function(e){
    e.preventDefault();

    NN.Phone.Animations.TopSlideUp(".background-custom", 200, -23);
});

// Profile Picture

var PressedProfilePicture = null;
var PressedProfilePictureObject = null;
var OldProfilePicture = null;
var ProfilePictureIsChecked = null;

$(document).on('click', '#accept-profilepicture', function(e){
    e.preventDefault();
    var ProfilePicture = NN.Phone.Data.MetaData.profilepicture;
    if (ProfilePicture === "default") {
        NN.Phone.Notifications.Add("fas fa-paint-brush", "Settings", "Standard avatar set!")
        NN.Phone.Animations.TopSlideUp(".settings-"+NN.Phone.Settings.OpenedTab+"-tab", 200, -100);
        $("[data-settingstab='profilepicture']").find('.settings-tab-icon').html('<img src="./img/default.png">');
    } else {
        NN.Phone.Notifications.Add("fas fa-paint-brush", "Settings", "Personal avatar set!")
        NN.Phone.Animations.TopSlideUp(".settings-"+NN.Phone.Settings.OpenedTab+"-tab", 200, -100);
        console.log(ProfilePicture)
        $("[data-settingstab='profilepicture']").find('.settings-tab-icon').html('<img src="'+ProfilePicture+'">');
    }
    $.post('https://Drk-phone/UpdateProfilePicture', JSON.stringify({
        profilepicture: ProfilePicture,
    }));
});

$(document).on('click', '#accept-custom-profilepicture', function(e){
    e.preventDefault();
    NN.Phone.Data.MetaData.profilepicture = $(".custom-profilepicture-input").val();
    $(OldProfilePicture).fadeOut(50, function(){
        $(OldProfilePicture).remove();
    });
    $(PressedProfilePictureObject).append('<div class="profilepicture-option-current"><i class="fas fa-check-circle"></i></div>');
    NN.Phone.Animations.TopSlideUp(".profilepicture-custom", 200, -23);
});

$(document).on('click', '.profilepicture-option', function(e){
    e.preventDefault();
    PressedProfilePicture = $(this).data('profilepicture');
    PressedProfilePictureObject = this;
    OldProfilePicture = $(this).parent().find('.profilepicture-option-current');
    ProfilePictureIsChecked = $(this).find('.profilepicture-option-current');
    if (ProfilePictureIsChecked.length === 0) {
        if (PressedProfilePicture != "custom-profilepicture") {
            NN.Phone.Data.MetaData.profilepicture = PressedProfilePicture
            $(OldProfilePicture).fadeOut(50, function(){
                $(OldProfilePicture).remove();
            });
            $(PressedProfilePictureObject).append('<div class="profilepicture-option-current"><i class="fas fa-check-circle"></i></div>');
        } else {
            NN.Phone.Animations.TopSlideDown(".profilepicture-custom", 200, 13);
        }
    }
});

$(document).on('click', '#cancel-profilepicture', function(e){
    e.preventDefault();
    NN.Phone.Animations.TopSlideUp(".settings-"+NN.Phone.Settings.OpenedTab+"-tab", 200, -100);
});


$(document).on('click', '#cancel-custom-profilepicture', function(e){
    e.preventDefault();
    NN.Phone.Animations.TopSlideUp(".profilepicture-custom", 200, -23);
});