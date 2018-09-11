'use strict'

// var errors		= require('errors')

function Generator(generatorConstructor, args
/* debug: coroutine		
, name
*/
) {
	this.callback = args.pop()
	args.push(this)
	this.generator = generatorConstructor.apply(this, args)

	/* debug: coroutine		
	this.name = name
	*/


	this.resume = this.resume.bind(this)
	this.resumeWithError = this.resumeWithError.bind(this)
	this.schedule = 0
	this.groupResult = { times: {} }
}

Generator.prototype = {

	none: function() {},
	resume: function(err, result) {

	    if(this.inNext) {
	    	var self = this
	    	// process.nextTick(function() {
	    		self.resume(err, result)
	    	// })
	    	return
	    }

		/* debug: coroutine
		
		console.log(%dt% + 'resume ' + this.name )

		var error = new Error(), stack = error.stack.split('\n')
		console.log(stack.join('\n'))

		*/

		this.hasResume = true
		if(err) {
			if(this.throwErrors) {
				var result = this.generator.throw(err)
			}
			else {
				this.error(err)
			}
		}
		else {
			this.next(result)
		}
	},

	resumeWithError: function(err, result) {
		this.next([err, result])
	},

	next: function(value) {


		try {

			/* debug: coroutine
		
			console.log(%dt% + 'before next ' + this.name )

			*/

			this.inNext = true
			var result = this.generator.next(value)
			delete this.inNext

			/* debug: coroutine
		
			console.log(%dt% + 'after next ' + this.name )

			*/


			if(result.done) {

				/* debug: coroutine
		
				console.log(%dt% + 'is done ' + this.name )
				console.log(%dt% + 'value: ' + result.value )
			
				*/

				if(this.hasResume) {
					/* debug: coroutine		
					console.log(%dt% + 'callback 1 ' + this.name )
					*/
					if(this.callback) this.callback(null, result.value)
				}
				else {
					/* debug: coroutine		
					console.log(%dt% + 'callback 2 ' + this.name )

					var error = new Error(), stack = error.stack.split('\n')
					console.log(stack.join('\n'))

					*/
					// process.nextTick(function() {

						/* debug: coroutine		
						console.log(%dt% + 'callback 3 ' + this.name )
						*/

						// if(this.callback && !this.hasResume) this.callback(null, result.value)
						if(this.callback) this.callback(null, result.value)
					// }.bind(this))
				}
			}
		}
		catch(err) {
			this.error(err)
		}
	},

	error: function(err) {
		var needShift = !(err instanceof Error)
		/*
		err = errors.Common.create(err)
		if(needShift) {
			err.stack.shift()
			err.stack.shift()
		}
		console.showError(err)
		*/
		if(this.callback) this.callback(err)
	},

	group: function(group_id, operator_id) {

		var ctx = { self: this, group_id: group_id, operator_id: operator_id
		//	, startTime: process.hrtime()
		}
		this.schedule ++

		var f = function(err, result) {

			if(!(this.group_id in this.self.groupResult)) this.self.groupResult[this.group_id] = { }
			this.self.groupResult[this.group_id][this.operator_id] = { err: err, result: result }
			var key = this.group_id + '_' + this.operator_id
			// var diff = process.hrtime(this.startTime)

			// this.self.groupResult.times[key] = ((diff[0] * 1e9 + diff[1]) / 1e9).toFixed(5)

			this.self.schedule --

			if(this.self.schedule < 1) {

				var result = this.self.groupResult
				this.self.groupResult = { times: {} }

				this.self.next(result)
			}
		}
			
		return f.bind(ctx)
	}

}

function coroutine(generatorConstructor
/* debug: coroutine		
, name
*/
) {
	return function() {
		var generatorObject = new Generator(generatorConstructor, Array.prototype.slice.call(arguments)
/* debug: coroutine		
, name
*/
)
		generatorObject.next()

		return generatorObject
	}
}

coroutine.method = function(generatorConstructor) {

	return function() {

		var args = Array.prototype.slice.call(arguments)
		args.unshift(this)

		var generatorObject = new Generator(generatorConstructor, args)

		generatorObject.next()

		return generatorObject
	}
}

// module.exports = coroutine