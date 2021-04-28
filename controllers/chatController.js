exports.get_chatbox = function(req, res){
    res.render('back_talks.hbs', {
        layout: 'admin_panel.hbs',
        helpers: {
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    })
}

//can I pass socketio client to this? 
//populating data from database