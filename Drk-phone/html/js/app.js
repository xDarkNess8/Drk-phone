NN = {}
NN.Phone = {}
NN.Screen = {}
NN.Phone.Functions = {}
NN.Phone.Animations = {}
NN.Phone.Notifications = {}
NN.Phone.ContactColors = {
    0: "#9b59b6",
    1: "#3498db",
    2: "#e67e22",
    3: "#e74c3c",
    4: "#1abc9c",
    5: "#9c88ff",
}

NN.Phone.Data = {
    currentApplication: null,
    PlayerData: {},
    Applications: {},
    IsOpen: false,
    CallActive: false,
    MetaData: {},
    PlayerJob: {},
    AnonymousCall: false,
}

NN.Phone.Data.MaxSlots = 16;

OpenedChatData = {
    number: null,
}

var CanOpenApp = true;

function IsAppJobBlocked(joblist, myjob) {
    var retval = false;
    if (joblist.length > 0) {
        $.each(joblist, function(i, job) {
            if (job == myjob && NN.Phone.Data.PlayerData.job.onduty) {
                retval = true;
            }
        });
    }
    return retval;
}

NN.Phone.Functions.SetupApplications = function(data) {
    NN.Phone.Data.Applications = data.applications;

    var i;
    for (i = 1; i <= NN.Phone.Data.MaxSlots; i++) {
        var applicationSlot = $(".phone-applications").find('[data-appslot="' + i + '"]');
        $(applicationSlot).html("");
        $(applicationSlot).css({
            "background-color": "transparent"
        });
        $(applicationSlot).prop('title', "");
        $(applicationSlot).removeData('app');
        $(applicationSlot).removeData('placement')
    }

    $.each(data.applications, function(i, app) {
        var applicationSlot = $(".phone-applications").find('[data-appslot="' + app.slot + '"]');
        var blockedapp = IsAppJobBlocked(app.blockedjobs, NN.Phone.Data.PlayerJob.name)

        if ((!app.job || app.job === NN.Phone.Data.PlayerJob.name) && !blockedapp) {
            // $(applicationSlot).css({"background-color":app.color});
            var icon = '<i class="ApplicationIcon ' + app.icon + '" style="' + app.style + '"></i>';
            if (app.app == "meos") {
                icon = '<img src="./img/politie.png" class="police-icon">';
            }
            $(applicationSlot).html(icon + '<div class="app-unread-alerts">0</div>');
            $(applicationSlot).prop('title', app.tooltipText);
            $(applicationSlot).data('app', app.app);

            if (app.tooltipPos !== undefined) {
                $(applicationSlot).data('placement', app.tooltipPos)
            }
        }
    });

    $('[data-toggle="tooltip"]').tooltip();
}

NN.Phone.Functions.SetupAppWarnings = function(AppData) {
    $.each(AppData, function(i, app) {
        var AppObject = $(".phone-applications").find("[data-appslot='" + app.slot + "']").find('.app-unread-alerts');

        if (app.Alerts > 0) {
            $(AppObject).html(app.Alerts);
            $(AppObject).css({ "display": "block" });
        } else {
            $(AppObject).css({ "display": "none" });
        }
    });
}

NN.Phone.Functions.IsAppHeaderAllowed = function(app) {
    var retval = true;
    $.each(Config.HeaderDisabledApps, function(i, blocked) {
        if (app == blocked) {
            retval = false;
        }
    });
    return retval;
}

$(document).on('click', '.phone-application', function(e) {
    e.preventDefault();
    var PressedApplication = $(this).data('app');
    var AppObject = $("." + PressedApplication + "-app");

    if (AppObject.length !== 0) {
        if (CanOpenApp) {
            if (NN.Phone.Data.currentApplication == null) {
                NN.Phone.Animations.TopSlideDown('.phone-application-container', 300, 0);
                NN.Phone.Functions.ToggleApp(PressedApplication, "block");

                if (NN.Phone.Functions.IsAppHeaderAllowed(PressedApplication)) {
                    NN.Phone.Functions.HeaderTextColor("white", 300);
                }

                NN.Phone.Data.currentApplication = PressedApplication;

                if (PressedApplication == "settings") {
                    $("#myPhoneNumber").text(NN.Phone.Data.PlayerData.charinfo.phone);
                    $("#mySerialNumber").text("" + NN.Phone.Data.PlayerData.metadata["phonedata"].SerialNumber);
                    $('#id1').val($('#id1').val() + 'more text');
                } else if (PressedApplication == "twitter") {
                    $.post('https://Drk-phone/GetMentionedTweets', JSON.stringify({}), function(MentionedTweets) {
                        NN.Phone.Notifications.LoadMentionedTweets(MentionedTweets)
                    })
                    $.post('https://Drk-phone/GetHashtags', JSON.stringify({}), function(Hashtags) {
                        NN.Phone.Notifications.LoadHashtags(Hashtags)
                    })
                    if (NN.Phone.Data.IsOpen) {
                        $.post('https://Drk-phone/GetTweets', JSON.stringify({}), function(Tweets) {
                            NN.Phone.Notifications.LoadTweets(Tweets);
                        });
                    }
                } else if (PressedApplication == "bank") {
                    NN.Phone.Functions.DoBankOpen();
                    $.post('https://Drk-phone/GetBankContacts', JSON.stringify({}), function(contacts) {
                        NN.Phone.Functions.LoadContactsWithNumber(contacts);
                    });
                    $.post('https://Drk-phone/GetInvoices', JSON.stringify({}), function(invoices) {
                        NN.Phone.Functions.LoadBankInvoices(invoices);
                    });
                } else if (PressedApplication == "whatsapp") {
                    $.post('https://Drk-phone/GetWhatsappChats', JSON.stringify({}), function(chats) {
                        NN.Phone.Functions.LoadWhatsappChats(chats);
                    });
                } else if (PressedApplication == "phone") {
                    $.post('https://Drk-phone/GetMissedCalls', JSON.stringify({}), function(recent) {
                        NN.Phone.Functions.SetupRecentCalls(recent);
                    });
                    $.post('https://Drk-phone/GetSuggestedContacts', JSON.stringify({}), function(suggested) {
                        NN.Phone.Functions.SetupSuggestedContacts(suggested);
                    });
                    $.post('https://Drk-phone/ClearGeneralAlerts', JSON.stringify({
                        app: "phone"
                    }));
                } else if (PressedApplication == "mail") {
                    $.post('https://Drk-phone/GetMails', JSON.stringify({}), function(mails) {
                        NN.Phone.Functions.SetupMails(mails);
                    });
                    $.post('https://Drk-phone/ClearGeneralAlerts', JSON.stringify({
                        app: "mail"
                    }));
                } else if (PressedApplication == "advert") {
                    $.post('https://Drk-phone/LoadAdverts', JSON.stringify({}), function(Adverts) {
                        NN.Phone.Functions.RefreshAdverts(Adverts);
                    })
                } else if (PressedApplication == "garage") {
                    $.post('https://Drk-phone/SetupGarageVehicles', JSON.stringify({}), function(Vehicles) {
                        SetupGarageVehicles(Vehicles);
                    })
                } else if (PressedApplication == "crypto") {
                    $.post('https://Drk-phone/GetCryptoData', JSON.stringify({
                        crypto: "qbit",
                    }), function(CryptoData) {
                        SetupCryptoData(CryptoData);
                    })

                    $.post('https://Drk-phone/GetCryptoTransactions', JSON.stringify({}), function(data) {
                        RefreshCryptoTransactions(data);
                    })
                } else if (PressedApplication == "racing") {
                    $.post('https://Drk-phone/GetAvailableRaces', JSON.stringify({}), function(Races) {
                        SetupRaces(Races);
                    });
                } else if (PressedApplication == "houses") {
                    $.post('https://Drk-phone/GetPlayerHouses', JSON.stringify({}), function(Houses) {
                        SetupPlayerHouses(Houses);
                    });
                    $.post('https://Drk-phone/GetPlayerKeys', JSON.stringify({}), function(Keys) {
                        $(".house-app-mykeys-container").html("");
                        if (Keys.length > 0) {
                            $.each(Keys, function(i, key) {
                                var elem = '<div class="mykeys-key" id="keyid-' + i + '"> <span class="mykeys-key-label">' + key.HouseData.adress + '</span> <span class="mykeys-key-sub">Click to set GPS</span> </div>';

                                $(".house-app-mykeys-container").append(elem);
                                $("#keyid-" + i).data('KeyData', key);
                            });
                        }
                    });
                } else if (PressedApplication == "meos") {
                    SetupMeosHome();
                } else if (PressedApplication == "store") {
                    $.post('https://Drk-phone/SetupStoreApps', JSON.stringify({}), function(data) {
                        SetupAppstore(data);
                    });
                } else if (PressedApplication == "trucker") {
                    $.post('https://Drk-phone/GetTruckerData', JSON.stringify({}), function(data) {
                        SetupTruckerInfo(data);
                    });
                }
            }
        }
    } else {
        NN.Phone.Notifications.Add("fas fa-exclamation-circle", "System", NN.Phone.Data.Applications[PressedApplication].tooltipText + " is not available!")
    }
});

$(document).on('click', '.mykeys-key', function(e) {
    e.preventDefault();

    var KeyData = $(this).data('KeyData');

    $.post('https://Drk-phone/SetHouseLocation', JSON.stringify({
        HouseData: KeyData
    }))
});

$(document).on('click', '.phone-home-container', function(event) {
    event.preventDefault();

    if (NN.Phone.Data.currentApplication === null) {
        NN.Phone.Functions.Close();
    } else {
        NN.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
        NN.Phone.Animations.TopSlideUp('.' + NN.Phone.Data.currentApplication + "-app", 400, -160);
        CanOpenApp = false;
        setTimeout(function() {
            NN.Phone.Functions.ToggleApp(NN.Phone.Data.currentApplication, "none");
            CanOpenApp = true;
        }, 400)
        NN.Phone.Functions.HeaderTextColor("white", 300);

        if (NN.Phone.Data.currentApplication == "whatsapp") {
            if (OpenedChatData.number !== null) {
                setTimeout(function() {
                    $(".whatsapp-chats").css({ "display": "block" });
                    $(".whatsapp-chats").animate({
                        left: 8 + "%"
                    }, 1);
                    $(".whatsapp-openedchat").animate({
                        left: 1 + "vh"
                    }, 1, function() {
                        $(".whatsapp-openedchat").css({ "display": "none" });
                    });
                    OpenedChatPicture = null;
                    OpenedChatData.number = null;
                }, 450);
            }
        } else if (NN.Phone.Data.currentApplication == "bank") {
            if (CurrentTab == "invoices") {
                setTimeout(function() {
                    $(".bank-app-invoices").animate({ "left": "30vh" });
                    $(".bank-app-invoices").css({ "display": "none" })
                    $(".bank-app-accounts").css({ "display": "block" })
                    $(".bank-app-accounts").css({ "left": "0vh" });

                    var InvoicesObjectBank = $(".bank-app-header").find('[data-headertype="invoices"]');
                    var HomeObjectBank = $(".bank-app-header").find('[data-headertype="accounts"]');

                    $(InvoicesObjectBank).removeClass('bank-app-header-button-selected');
                    $(HomeObjectBank).addClass('bank-app-header-button-selected');

                    CurrentTab = "accounts";
                }, 400)
            }
        } else if (NN.Phone.Data.currentApplication == "meos") {
            $(".meos-alert-new").remove();
            setTimeout(function() {
                $(".meos-recent-alert").removeClass("noodknop");
                $(".meos-recent-alert").css({ "background-color": "#004682" });
            }, 400)
        }

        NN.Phone.Data.currentApplication = null;
    }
});

NN.Phone.Functions.Open = function(data) {
    NN.Phone.Animations.BottomSlideUp('.container', 300, 0);
    NN.Phone.Notifications.LoadTweets(data.Tweets);
    NN.Phone.Data.IsOpen = true;
}

NN.Phone.Functions.ToggleApp = function(app, show) {
    $("." + app + "-app").css({ "display": show });
}

NN.Phone.Functions.Close = function() {

    if (NN.Phone.Data.currentApplication == "whatsapp") {
        setTimeout(function() {
            NN.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
            NN.Phone.Animations.TopSlideUp('.' + NN.Phone.Data.currentApplication + "-app", 400, -160);
            $(".whatsapp-app").css({ "display": "none" });
            NN.Phone.Functions.HeaderTextColor("white", 300);

            if (OpenedChatData.number !== null) {
                setTimeout(function() {
                    $(".whatsapp-chats").css({ "display": "block" });
                    $(".whatsapp-chats").animate({
                        left: 0 + "vh"
                    }, 1);
                    $(".whatsapp-openedchat").animate({
                        left: 1 + "vh"
                    }, 1, function() {
                        $(".whatsapp-openedchat").css({ "display": "none" });
                    });
                    OpenedChatData.number = null;
                }, 450);
            }
            OpenedChatPicture = null;
            NN.Phone.Data.currentApplication = null;
        }, 500)
    } else if (NN.Phone.Data.currentApplication == "meos") {
        $(".meos-alert-new").remove();
        $(".meos-recent-alert").removeClass("noodknop");
        $(".meos-recent-alert").css({ "background-color": "#004682" });
    }

    NN.Phone.Animations.BottomSlideDown('.container', 300, -70);
    $.post('https://Drk-phone/Close');
    NN.Phone.Data.IsOpen = false;
}

NN.Phone.Functions.HeaderTextColor = function(newColor, Timeout) {
    $(".phone-header").animate({ color: newColor }, Timeout);
}

NN.Phone.Animations.BottomSlideUp = function(Object, Timeout, Percentage) {
    $(Object).css({ 'display': 'block' }).animate({
        bottom: Percentage + "%",
    }, Timeout);
}

NN.Phone.Animations.BottomSlideDown = function(Object, Timeout, Percentage) {
    $(Object).css({ 'display': 'block' }).animate({
        bottom: Percentage + "%",
    }, Timeout, function() {
        $(Object).css({ 'display': 'none' });
    });
}

NN.Phone.Animations.TopSlideDown = function(Object, Timeout, Percentage) {
    $(Object).css({ 'display': 'block' }).animate({
        top: Percentage + "%",
    }, Timeout);
}

NN.Phone.Animations.TopSlideUp = function(Object, Timeout, Percentage, cb) {
    $(Object).css({ 'display': 'block' }).animate({
        top: Percentage + "%",
    }, Timeout, function() {
        $(Object).css({ 'display': 'none' });
    });
}

NN.Phone.Notifications.Add = function(icon, title, text, color, timeout) {
    $.post('https://Drk-phone/HasPhone', JSON.stringify({}), function(HasPhone) {
        if (HasPhone) {
            if (timeout == null && timeout == undefined) {
                timeout = 5000;
            }
            if (NN.Phone.Notifications.Timeout == undefined || NN.Phone.Notifications.Timeout == null) {
                if (color != null || color != undefined) {
                    $(".notification-icon").css({ "color": color });
                    $(".notification-title").css({ "color": color });
                } else if (color == "default" || color == null || color == undefined) {
                    $(".notification-icon").css({ "color": "#e74c3c" });
                    $(".notification-title").css({ "color": "#e74c3c" });
                }
                if (!NN.Phone.Data.IsOpen) {
                    NN.Phone.Animations.BottomSlideUp('.container', 300, -52);
                }
                NN.Phone.Animations.TopSlideDown(".phone-notification-container", 200, 8);
                if (icon !== "politie") {
                    $(".notification-icon").html('<i class="' + icon + '"></i>');
                } else {
                    $(".notification-icon").html('<img src="./img/politie.png" class="police-icon-notify">');
                }
                $(".notification-title").html(title);
                $(".notification-text").html(text);
                if (NN.Phone.Notifications.Timeout !== undefined || NN.Phone.Notifications.Timeout !== null) {
                    clearTimeout(NN.Phone.Notifications.Timeout);
                }
                NN.Phone.Notifications.Timeout = setTimeout(function() {
                    NN.Phone.Animations.TopSlideUp(".phone-notification-container", 200, -8);
                    if (!NN.Phone.Data.IsOpen) {
                        NN.Phone.Animations.BottomSlideUp('.container', 300, -100);
                    }
                    NN.Phone.Notifications.Timeout = null;
                }, timeout);
            } else {
                if (color != null || color != undefined) {
                    $(".notification-icon").css({ "color": color });
                    $(".notification-title").css({ "color": color });
                } else {
                    $(".notification-icon").css({ "color": "#e74c3c" });
                    $(".notification-title").css({ "color": "#e74c3c" });
                }
                if (!NN.Phone.Data.IsOpen) {
                    NN.Phone.Animations.BottomSlideUp('.container', 300, -52);
                }
                $(".notification-icon").html('<i class="' + icon + '"></i>');
                $(".notification-title").html(title);
                $(".notification-text").html(text);
                if (NN.Phone.Notifications.Timeout !== undefined || NN.Phone.Notifications.Timeout !== null) {
                    clearTimeout(NN.Phone.Notifications.Timeout);
                }
                NN.Phone.Notifications.Timeout = setTimeout(function() {
                    NN.Phone.Animations.TopSlideUp(".phone-notification-container", 200, -8);
                    if (!NN.Phone.Data.IsOpen) {
                        NN.Phone.Animations.BottomSlideUp('.container', 300, -100);
                    }
                    NN.Phone.Notifications.Timeout = null;
                }, timeout);
            }
        }
    });
}

NN.Phone.Functions.LoadPhoneData = function(data) {
    NN.Phone.Data.PlayerData = data.PlayerData;
    NN.Phone.Data.PlayerJob = data.PlayerJob;
    NN.Phone.Data.MetaData = data.PhoneData.MetaData;
    NN.Phone.Functions.LoadMetaData(data.PhoneData.MetaData);
    NN.Phone.Functions.LoadContacts(data.PhoneData.Contacts);
    NN.Phone.Functions.SetupApplications(data);
    $("#phone-serverid").html("<span style='font-size: 1.2vh; font-weight:bold;'>" + data.serverid + "</span>");
    console.log("Phone succesfully loaded!");
}

NN.Phone.Functions.UpdateTime = function(data) {
    $("#phone-time").html("<span style='font-size: 1.2vh;'>" + data.InGameTime.hour + ":" + data.InGameTime.minute + "</span>");
}

var NotificationTimeout = null;

NN.Screen.Notification = function(title, content, icon, timeout, color) {
    $.post('https://Drk-phone/HasPhone', JSON.stringify({}), function(HasPhone) {
        if (HasPhone) {
            if (color != null && color != undefined) {
                $(".screen-notifications-container").css({ "background-color": color });
            }
            $(".screen-notification-icon").html('<i class="' + icon + '"></i>');
            $(".screen-notification-title").text(title);
            $(".screen-notification-content").text(content);
            $(".screen-notifications-container").css({ 'display': 'block' }).animate({
                right: 5 + "vh",
            }, 200);

            if (NotificationTimeout != null) {
                clearTimeout(NotificationTimeout);
            }

            NotificationTimeout = setTimeout(function() {
                $(".screen-notifications-container").animate({
                    right: -35 + "vh",
                }, 200, function() {
                    $(".screen-notifications-container").css({ 'display': 'none' });
                });
                NotificationTimeout = null;
            }, timeout);
        }
    });
}

// NN.Screen.Notification("Nieuwe Tweet", "Dit is een test tweet like #YOLO", "fab fa-twitter", 4000);

$(document).ready(function() {
    window.addEventListener('message', function(event) {
        switch (event.data.action) {
            case "open":
                NN.Phone.Functions.Open(event.data);
                NN.Phone.Functions.SetupAppWarnings(event.data.AppData);
                NN.Phone.Functions.SetupCurrentCall(event.data.CallData);
                NN.Phone.Data.IsOpen = true;
                NN.Phone.Data.PlayerData = event.data.PlayerData;
                break;
                // case "LoadPhoneApplications":
                //     NN.Phone.Functions.SetupApplications(event.data);
                //     break;
            case "LoadPhoneData":
                NN.Phone.Functions.LoadPhoneData(event.data);
                break;
            case "UpdateTime":
                NN.Phone.Functions.UpdateTime(event.data);
                break;
            case "Notification":
                NN.Screen.Notification(event.data.NotifyData.title, event.data.NotifyData.content, event.data.NotifyData.icon, event.data.NotifyData.timeout, event.data.NotifyData.color);
                break;
            case "PhoneNotification":
                NN.Phone.Notifications.Add(event.data.PhoneNotify.icon, event.data.PhoneNotify.title, event.data.PhoneNotify.text, event.data.PhoneNotify.color, event.data.PhoneNotify.timeout);
                break;
            case "RefreshAppAlerts":
                NN.Phone.Functions.SetupAppWarnings(event.data.AppData);
                break;
            case "UpdateMentionedTweets":
                NN.Phone.Notifications.LoadMentionedTweets(event.data.Tweets);
                break;
            case "UpdateBank":
                $(".bank-app-account-balance").html("&#36; " + event.data.NewBalance);
                $(".bank-app-account-balance").data('balance', event.data.NewBalance);
                break;
            case "UpdateChat":
                if (NN.Phone.Data.currentApplication == "whatsapp") {
                    if (OpenedChatData.number !== null && OpenedChatData.number == event.data.chatNumber) {
                        console.log('Chat reloaded')
                        NN.Phone.Functions.SetupChatMessages(event.data.chatData);
                    } else {
                        console.log('Chats reloaded')
                        NN.Phone.Functions.LoadWhatsappChats(event.data.Chats);
                    }
                }
                break;
            case "UpdateHashtags":
                NN.Phone.Notifications.LoadHashtags(event.data.Hashtags);
                break;
            case "RefreshWhatsappAlerts":
                NN.Phone.Functions.ReloadWhatsappAlerts(event.data.Chats);
                break;
            case "CancelOutgoingCall":
                $.post('https://Drk-phone/HasPhone', JSON.stringify({}), function(HasPhone) {
                    if (HasPhone) {
                        CancelOutgoingCall();
                    }
                });
                break;
            case "IncomingCallAlert":
                $.post('https://Drk-phone/HasPhone', JSON.stringify({}), function(HasPhone) {
                    if (HasPhone) {
                        IncomingCallAlert(event.data.CallData, event.data.Canceled, event.data.AnonymousCall);
                    }
                });
                break;
            case "SetupHomeCall":
                NN.Phone.Functions.SetupCurrentCall(event.data.CallData);
                break;
            case "AnswerCall":
                NN.Phone.Functions.AnswerCall(event.data.CallData);
                break;
            case "UpdateCallTime":
                var CallTime = event.data.Time;
                var date = new Date(null);
                date.setSeconds(CallTime);
                var timeString = date.toISOString().substr(11, 8);

                if (!NN.Phone.Data.IsOpen) {
                    if ($(".call-notifications").css("right") !== "52.1px") {
                        $(".call-notifications").css({ "display": "block" });
                        $(".call-notifications").animate({ right: 5 + "vh" });
                    }
                    $(".call-notifications-title").html("In conversation (" + timeString + ")");
                    $(".call-notifications-content").html("Calling with " + event.data.Name);
                    $(".call-notifications").removeClass('call-notifications-shake');
                } else {
                    $(".call-notifications").animate({
                        right: -35 + "vh"
                    }, 400, function() {
                        $(".call-notifications").css({ "display": "none" });
                    });
                }

                $(".phone-call-ongoing-time").html(timeString);
                $(".phone-currentcall-title").html("In conversation (" + timeString + ")");
                break;
            case "CancelOngoingCall":
                $(".call-notifications").animate({ right: -35 + "vh" }, function() {
                    $(".call-notifications").css({ "display": "none" });
                });
                NN.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
                setTimeout(function() {
                    NN.Phone.Functions.ToggleApp("phone-call", "none");
                    $(".phone-application-container").css({ "display": "none" });
                }, 400)
                NN.Phone.Functions.HeaderTextColor("white", 300);

                NN.Phone.Data.CallActive = false;
                NN.Phone.Data.currentApplication = null;
                break;
            case "RefreshContacts":
                NN.Phone.Functions.LoadContacts(event.data.Contacts);
                break;
            case "UpdateMails":
                NN.Phone.Functions.SetupMails(event.data.Mails);
                break;
            case "RefreshAdverts":
                if (NN.Phone.Data.currentApplication == "advert") {
                    NN.Phone.Functions.RefreshAdverts(event.data.Adverts);
                }
                break;
            case "AddPoliceAlert":
                AddPoliceAlert(event.data)
                break;
            case "UpdateApplications":
                NN.Phone.Data.PlayerJob = event.data.JobData;
                NN.Phone.Functions.SetupApplications(event.data);
                break;
            case "UpdateTransactions":
                RefreshCryptoTransactions(event.data);
                break;
            case "UpdateRacingApp":
                $.post('https://Drk-phone/GetAvailableRaces', JSON.stringify({}), function(Races) {
                    SetupRaces(Races);
                });
                break;
            case "RefreshAlerts":
                NN.Phone.Functions.SetupAppWarnings(event.data.AppData);
                break;
        }
    })
});

$(document).on('keydown', function() {
    switch (event.keyCode) {
        case 27: // ESCAPE
            NN.Phone.Functions.Close();
            break;
    }
});