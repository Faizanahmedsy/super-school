from nest_db_app.management.commands.update_assessment_status import update_assessment_status

def my_task():

    try:
        update_assessment_status_log =  update_assessment_status()
        print(update_assessment_status_log)
    except Exception as e:
        print(f"An error occurred: {e}")