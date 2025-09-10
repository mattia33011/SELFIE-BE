import { ReplaySubject } from "rxjs";

class TimeMachine {
    private _today?: Date = undefined
    public todayObservable = new ReplaySubject(1);

    setToday(date: Date){
        this._today = date;
        this.todayObservable.next(date) // subscribe to this 
    }
    resetToday(){
        this.setToday(new Date())
        this._today = undefined
    }
    
    getToday = () => this._today ? this._today : new Date() 
    
}

const timeMachine = new TimeMachine()

export default timeMachine;