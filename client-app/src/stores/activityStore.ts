import { makeAutoObservable, runInAction } from "mobx";
import agent from "src/async/fetcher/agent";
import type { Activity } from "~/app/models/activity";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  isEditing = false;
  isLoading = false;
  isLoadingInitial = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }

  loadActivities = async () => {
    this.isLoadingInitial = true;
    try {
      const activitiesFromDb = await agent.Activities.list();
      runInAction(() => {
        activitiesFromDb.forEach((act) => {
          this.addActivityToRegistry(act);
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.setLoadingInitial(false);
    }
  };

  loadActivityFromId = async (id: string) => {
    let activity = this.getActivityFromRegistry(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      console.log("BEGIN FETCHING");
      this.isLoadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        console.log("SUCCESS FETCHING");
        this.addActivityToRegistry(activity);
        this.setSelectedActivity(activity);
        this.setLoadingInitial(false);
        return activity;
      } catch (error) {
        console.log(error);
        this.setLoadingInitial(false);
      }
    }
  };

  private addActivityToRegistry = (activity: Activity) => {
    activity.date = activity.date.split("T")[0];
    this.activityRegistry.set(activity.id, activity);
  };
  private getActivityFromRegistry = (id: string) => {
    return this.activityRegistry.get(id);
  };
  private setSelectedActivity = (activity: Activity) => {
    this.selectedActivity = activity;
  };

  setLoadingInitial = (state: boolean) => {
    this.isLoadingInitial = state;
  };

  createActivity = async (activity: Activity) => {
    this.isLoading = true;
    try {
      await agent.Activities.create(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.isEditing = false;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
  updateActivity = async (activity: Activity) => {
    this.isLoading = true;
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.isEditing = false;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  deleteActivity = async (id: string) => {
    this.isLoading = true;
    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id);
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}